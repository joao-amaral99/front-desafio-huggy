<script setup lang="ts">
import SearchBar from '@/components/forms/SearchBar.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ContactDialog from '@/components/dialogs/ContactDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import ContactFormDialog from '@/components/dialogs/ContactFormDialog.vue'
import Loader from '@/components/ui/Loader.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import { apiService, type Contact } from '@/services/api'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData } from 'chart.js'
import { chartOptions, createChartData } from '@/utils/chartConfig'

ChartJS.register(ArcElement, Tooltip, Legend)

const contacts = ref<Contact[]>([])
const $toast = useToast()
const isLoading = ref(false)
const searchQuery = ref('')
const showReports = ref(false)
const sortOrder = ref<'asc' | 'desc'>('asc')

const selectedContact = ref<Contact | null>(null)
const isDialogOpen = ref(false)

const showConfirmDelete = ref(false)
const contactToDelete = ref<Contact | null>(null)

const showContactForm = ref(false)
const isEditingContact = ref(false)
const contactToEdit = ref<Contact | null>(null)

const isEmpty = computed(() => contacts.value.length === 0)

const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getErrorMessage = (error: any): string => {
  if (error.apiData) {
    const { apiData } = error

    if (apiData.errors && typeof apiData.errors === 'object') {
      const fieldErrors: string[] = []

      for (const [field, messages] of Object.entries(apiData.errors)) {
        if (Array.isArray(messages)) {
          fieldErrors.push(...messages)
        } else if (typeof messages === 'string') {
          fieldErrors.push(messages)
        }
      }

      if (fieldErrors.length > 0) {
        return fieldErrors.join('. ')
      }
    }

    if (apiData.message) {
      return apiData.message
    }
  }

  if (error.status) {
    switch (error.status) {
      case 422:
        return 'Dados inválidos. Verifique os campos obrigatórios.'
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.'
      default:
        return 'Erro inesperado. Tente novamente.'
    }
  }

  return 'Erro inesperado. Tente novamente.'
}

const openContactDialog = (contact: Contact) => {
  console.log('aqui')
  selectedContact.value = contact
  isDialogOpen.value = true
}
const closeContactDialog = () => {
  isDialogOpen.value = false
  selectedContact.value = null
}

const openEditForm = (contact: Contact) => {
  contactToEdit.value = contact
  isEditingContact.value = true
  showContactForm.value = true
  closeContactDialog()
}

const openCreateForm = () => {
  contactToEdit.value = null
  isEditingContact.value = false
  showContactForm.value = true
}

const closeContactForm = () => {
  showContactForm.value = false
  isEditingContact.value = false
  contactToEdit.value = null
}

const saveContact = async (contactData: Contact) => {
  try {
    isLoading.value = true

    if (isEditingContact.value && contactToEdit.value) {
      await apiService.updateContact(contactToEdit.value.id!, contactData)

      $toast.success('Contato atualizado com sucesso!', { position: 'top-right' })
    } else {
      await apiService.createContact(contactData)

      $toast.success('Contato criado com sucesso!', { position: 'top-right' })
    }

    // Só fecha o formulário em caso de sucesso
    closeContactForm()
    await loadContacts()
  } catch (error) {
    console.error('Erro ao salvar contato:', error)

    const errorMessage = getErrorMessage(error)
    $toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000, // Mais tempo para ler mensagens mais específicas
    })
  } finally {
    isLoading.value = false
  }
}

const openDeleteConfirm = (contact: Contact) => {
  contactToDelete.value = contact
  showConfirmDelete.value = true
}

const closeDeleteConfirm = () => {
  showConfirmDelete.value = false
  contactToDelete.value = null
}

const callContact = async (contact: Contact) => {
  try {
    const { id } = contact

    if (id) {
      await apiService.makeCall(id)
    }
  } catch (error) {
    console.error('Erro ao criar contato:', error)

    const errorMessage = getErrorMessage(error)
    $toast.error(errorMessage, { position: 'top-right', duration: 5000 })
  }
}

const confirmDelete = async () => {
  if (!contactToDelete.value?.id) return

  try {
    isLoading.value = true

    await apiService.deleteContact(contactToDelete.value.id)

    $toast.success('Contato excluído com sucesso!', { position: 'top-right' })

    closeDeleteConfirm()
    closeContactDialog()
    await loadContacts()
  } catch (error) {
    console.error('Erro ao deletar contato:', error)

    const errorMessage = getErrorMessage(error)
    $toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const loadContacts = async () => {
  isLoading.value = true

  try {
    const params: { search?: string; sort_order?: 'asc' | 'desc' } = {}

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    params.sort_order = sortOrder.value

    const contactsData = await apiService.getContacts(params)

    if (contactsData && Array.isArray(contactsData)) {
      contacts.value = contactsData.map((contact) => ({
        ...contact,
        initials: generateInitials(contact.name),
      }))
    } else {
      contacts.value = []
    }
  } catch (error) {
    console.error('Erro ao carregar contatos:', error)
    contacts.value = []

    const errorMessage = getErrorMessage(error)
    $toast.error(`Erro ao carregar contatos: ${errorMessage}`, {
      position: 'top-right',
      duration: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

// Função para alternar ordenação
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  loadContacts()
}

// Debounce para busca
let searchTimeout: NodeJS.Timeout | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    loadContacts()
  }, 500) // 500ms de delay
}

// Watcher para busca
watch(searchQuery, () => {
  debouncedSearch()
})

const toggleReports = async () => {
  showReports.value = !showReports.value

  // Carregar dados dos gráficos quando abrir a view de relatórios
  if (showReports.value) {
    await loadChartData()
  }
}

const goBackToContacts = () => {
  showReports.value = false
}

const stateChartData = ref<ChartData<'pie'>>({ labels: [], datasets: [] })
const cityChartData = ref<ChartData<'pie'>>({ labels: [], datasets: [] })
const isLoadingCharts = ref(false)

const loadChartData = async () => {
  try {
    isLoadingCharts.value = true

    const [stateData, cityData] = await Promise.all([
      apiService.getContactsByState(),
      apiService.getContactsByCity(),
    ])

    const stateGroups = stateData.reduce(
      (acc, item) => {
        acc[item.label] = item.value
        return acc
      },
      {} as Record<string, number>,
    )
    stateChartData.value = createChartData(stateGroups)

    const cityGroups = cityData.reduce(
      (acc, item) => {
        acc[item.label] = item.value
        return acc
      },
      {} as Record<string, number>,
    )

    cityChartData.value = createChartData(cityGroups)
  } catch (error) {
    console.error('Erro ao carregar dados dos gráficos:', error)

    const errorMessage = getErrorMessage(error)
    $toast.error(`Erro ao carregar dados dos gráficos: ${errorMessage}`, {
      position: 'top-right',
      duration: 5000,
    })
  } finally {
    isLoadingCharts.value = false
  }
}

onMounted(() => {
  loadContacts()
})
</script>

<template>
  <main class="contacts">
    <div class="contacts__center">
      <h2 class="contacts__title">Contatos</h2>
      <div class="contacts__table-container">
        <div v-if="!showReports" class="contacts__actions">
          <SearchBar v-model="searchQuery" />
          <div class="contacts__buttons">
            <BaseButton @click="openCreateForm" />
            <button
              class="icon-button"
              type="button"
              aria-label="Gerar relatório"
              @click="toggleReports"
            >
              <img src="@/assets/icons/report.svg" alt="Relatório" />
            </button>
          </div>
        </div>
        <!-- Tabela de contatos -->
        <div v-if="!showReports" class="contacts__table">
          <table class="table">
            <thead class="table__header">
              <tr class="table__header-row">
                <th class="table__header-cell">
                  <span class="table__header-title" @click="toggleSortOrder">
                    Nome
                    <img
                      src="@/assets/icons/arrow-down.svg"
                      alt="Ordenar por nome"
                      :class="[
                        'table__sort-icon',
                        { 'table__sort-icon--flipped': sortOrder === 'desc' },
                      ]"
                    />
                  </span>
                </th>
                <th class="table__header-cell">Email</th>
                <th class="table__header-cell">Telefone</th>
                <th class="table__header-cell"></th>
              </tr>
            </thead>
            <tbody class="table__body">
              <tr v-for="contact in contacts" :key="contact.email" class="table__row">
                <td
                  class="table__cell table__cell--name table__cell--clickable"
                  @click="openContactDialog(contact)"
                >
                  <div class="table__contact">
                    <div class="table__contact-avatar">
                      <template v-if="contact.photo">
                        <img
                          :src="contact.photo"
                          :alt="contact.name"
                          class="table__contact-photo"
                        />
                      </template>
                      <template v-else>
                        <span class="table__contact-initials">{{ contact.initials }}</span>
                      </template>
                    </div>
                    <span class="table__contact-name">{{ contact.name }}</span>
                  </div>
                </td>
                <td class="table__cell table__cell--clickable" @click="openContactDialog(contact)">
                  {{ contact.email }}
                </td>
                <td class="table__cell table__cell--clickable" @click="openContactDialog(contact)">
                  {{ contact.phone }}
                </td>
                <td class="table__cell table__cell--actions">
                  <div class="table__actions">
                    <button
                      class="table__action-btn"
                      type="button"
                      aria-label="Editar contato"
                      @click="openEditForm(contact)"
                    >
                      <img src="@/assets/icons/edit.svg" alt="Editar" />
                    </button>
                    <button
                      class="table__action-btn"
                      type="button"
                      aria-label="Excluir contato"
                      @click="openDeleteConfirm(contact)"
                    >
                      <img src="@/assets/icons/delete.svg" alt="Excluir" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="contacts__empty-state" v-if="isEmpty">
            <img
              src="../assets/images/book.png"
              alt="Nenhum contato encontrado"
              class="contacts__empty-image"
            />
            <p class="contacts__empty-text">Ainda não há contatos</p>
            <BaseButton title="Adicionar contato" @click="openCreateForm" />
          </div>
        </div>

        <!-- Relatórios com gráficos -->
        <div v-if="showReports" class="reports">
          <div class="reports__header">
            <button class="reports__back-button" @click="goBackToContacts" aria-label="Voltar">
              ← Voltar
            </button>
          </div>

          <div class="reports__content">
            <h3 class="reports__title">Dados sobre contatos</h3>

            <div class="reports__charts">
              <div class="chart-section">
                <h4 class="chart-section__title">Segmentação por estado</h4>
                <div class="chart-container">
                  <div v-if="isLoadingCharts" class="chart-loading">
                    <Loader />
                    <span class="chart-loading__text">Carregando dados...</span>
                  </div>
                  <Pie v-else :data="stateChartData" :options="chartOptions" />
                </div>
              </div>

              <div class="chart-section">
                <h4 class="chart-section__title">Segmentação por cidade</h4>
                <div class="chart-container">
                  <div v-if="isLoadingCharts" class="chart-loading">
                    <Loader />
                    <span class="chart-loading__text">Carregando dados...</span>
                  </div>
                  <Pie v-else :data="cityChartData" :options="chartOptions" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog de detalhes do usuário -->
    <ContactDialog
      :contact="selectedContact"
      :is-open="isDialogOpen"
      @close="closeContactDialog"
      @edit="openEditForm"
      @delete="openDeleteConfirm"
      @call="callContact"
    />

    <!-- Dialog de confirmação de exclusão -->
    <ConfirmDialog
      title="Excluir este contato?"
      :is-open="showConfirmDelete"
      :is-loading="isLoading"
      :is-destructive="true"
      @cancel="closeDeleteConfirm"
      @confirm="confirmDelete"
    />

    <!-- Dialog de formulário de contato -->
    <ContactFormDialog
      :is-open="showContactForm"
      :is-editing="isEditingContact"
      :contact="contactToEdit"
      :is-loading="isLoading"
      @close="closeContactForm"
      @save="saveContact"
    />
  </main>
</template>

<style scoped>
.contacts {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--color-gray-100);
}

.contacts__center {
  width: 930px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 auto;
  overflow: hidden;
}

.contacts__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-lg);
}

.contacts__actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.contacts__buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.icon-button {
  width: 44px;
  height: var(--height-button);
  background: transparent;
  border: none;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-normal);
  padding: 0;
}

.icon-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.icon-button img {
  width: 20px;
  height: 20px;
  display: block;
}

.contacts__table-container {
  width: 100%;
  height: 928px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-primary);
  background: var(--color-white);
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
}

.contacts__table {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.table {
  width: 100%;
  border-collapse: separate;
  font-family: var(--font-family-primary);
}

.table__header {
  position: sticky;
  top: 0;
  background: var(--color-white);
  z-index: 1;
}

.table__header-row {
  border-bottom: 1px solid var(--color-border-primary);
}

.table__header-cell {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md) var(--spacing-lg);
  text-align: left;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border-primary);
}

.table__header-title {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  user-select: none;
}

.table__sort-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  transition: transform var(--transition-normal);
  flex-shrink: 0;
}

.table__sort-icon:hover {
  transform: scale(1.1);
}

.table__sort-icon--flipped {
  transform: rotate(180deg);
}

.table__sort-icon--flipped:hover {
  transform: rotate(180deg) scale(1.1);
}

.table__body {
  background: var(--color-white);
}

.table__row {
  transition: background-color var(--transition-normal);
  max-width: 914px;
  height: 56px;
}

.table__row:hover .table__cell {
  background-color: var(--color-background-hover);
}

.table__row:hover .table__cell:first-child {
  border-top-left-radius: var(--border-radius-md);
  border-bottom-left-radius: var(--border-radius-md);
}

.table__row:hover .table__cell:last-child {
  border-top-right-radius: var(--border-radius-md);
  border-bottom-right-radius: var(--border-radius-md);
}

.table__row:hover .table__actions {
  opacity: 1;
  visibility: visible;
}

.table__cell {
  padding: var(--spacing-sm) var(--spacing-md);
  vertical-align: middle;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: 1.5;
  height: 56px;
}

.table__cell--name {
  width: 40%;
}

.table__cell--actions {
  width: 15%;
  text-align: center;
}

.table__cell--clickable {
  cursor: pointer;
}

.table__contact {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.table__contact-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-background-avatar);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.table__contact-initials {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
  background-color: var(--color-background-avatar);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table__contact-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.table__contact-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.table__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--transition-normal),
    visibility var(--transition-normal);
}

.table__action-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-normal);
  padding: 0;
}

.table__action-btn:hover {
  background-color: var(--color-gray-200);
}

.table__action-btn:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.table__action-btn img {
  width: 16px;
  height: 16px;
  display: block;
}

.contacts__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
  width: 100%;
  flex: 1;
  min-height: 400px;
}

.contacts__empty-image {
  width: auto;
  height: auto;
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.contacts__empty-text {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  margin: 0;
  line-height: 1.5;
}

/* Estilos para relatórios */
.reports {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
}

.reports__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-primary);
  margin-bottom: var(--spacing-lg);
}

.reports__back-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--spacing-xs) 0;
  transition: color var(--transition-normal);
}

.reports__back-button:hover {
  color: var(--color-primary-dark);
}

.reports__back-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}

.reports__export-button {
  background: var(--color-primary);
  border: none;
  color: var(--color-white);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-normal);
  height: var(--height-button);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.reports__export-button:hover {
  background: var(--color-primary-dark);
}

.reports__export-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.reports__content {
  flex: 1;
  overflow: auto;
}

.reports__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-xl) 0;
  text-align: center;
}

.reports__charts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.chart-section {
  padding: var(--spacing-md);
  width: 100%;
}

.chart-section__title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin: 0 0 var(--spacing-xs) 0;
  text-align: left;
}

.chart-container {
  height: 200px;
  width: 100%;
  max-width: 450px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: var(--spacing-xl);
}

.chart-container canvas {
  max-height: 200px !important;
  max-width: 450px !important;
}

.chart-loading {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.chart-loading__text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Responsividade para dispositivos menores */
@media (max-width: 768px) {
  .contacts__table {
    overflow-x: auto;
  }

  .table {
    min-width: 600px;
  }

  .reports__charts {
    gap: var(--spacing-lg);
  }

  .chart-container {
    height: 180px;
    max-width: 350px;
  }

  .chart-container canvas {
    max-height: 180px !important;
    max-width: 350px !important;
  }
}
</style>
