<script setup lang="ts">
import SearchBar from '@/components/forms/SearchBar.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ContactDialog from '@/components/dialogs/ContactDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import ContactFormDialog from '@/components/dialogs/ContactFormDialog.vue'
import Loader from '@/components/ui/Loader.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import { type Contact, contactService } from '@/services/contactService'
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
      await contactService.updateContact(contactToEdit.value.id!, contactData)

      $toast.success('Contato atualizado com sucesso!', { position: 'top-right' })
    } else {
      await contactService.createContact(contactData)

      $toast.success('Contato criado com sucesso!', { position: 'top-right' })
    }

    closeContactForm()
    await loadContacts()
  } catch (error) {
    console.error('Erro ao salvar contato:', error)

    const errorMessage = getErrorMessage(error)
    $toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
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
      await contactService.makeCall(id)
      $toast.success('Suceso! Aguarde a ligação.', { position: 'top-right' })
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

    await contactService.deleteContact(contactToDelete.value.id)

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

    const contactsData = await contactService.getContacts(params)

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

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  loadContacts()
}

let searchTimeout: NodeJS.Timeout | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    loadContacts()
  }, 500)
}

watch(searchQuery, () => {
  debouncedSearch()
})

const toggleReports = async () => {
  showReports.value = !showReports.value

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
      contactService.getContactsByState(),
      contactService.getContactsByCity(),
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
    <section class="contacts__center">
      <header>
        <h2 class="contacts__title">Contatos</h2>
      </header>

      <section class="contacts__table-container">
        <header v-if="!showReports" class="contacts__actions">
          <SearchBar v-model="searchQuery" />
          <nav class="contacts__buttons">
            <BaseButton @click="openCreateForm" />
            <button
              class="icon-button"
              type="button"
              aria-label="Gerar relatório"
              @click="toggleReports"
            >
              <img src="@/assets/icons/report.svg" alt="Relatório" />
            </button>
          </nav>
        </header>

        <section v-if="!showReports" class="contacts__table">
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
                <th class="table__header-cell" aria-label="Ações"></th>
              </tr>
            </thead>
            <tbody class="table__body">
              <tr v-for="contact in contacts" :key="contact.email" class="table__row">
                <td
                  class="table__cell table__cell--name table__cell--clickable"
                  @click="openContactDialog(contact)"
                >
                  <article class="table__contact">
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
                  </article>
                </td>
                <td class="table__cell table__cell--clickable" @click="openContactDialog(contact)">
                  {{ contact.email }}
                </td>
                <td class="table__cell table__cell--clickable" @click="openContactDialog(contact)">
                  {{ contact.phone }}
                </td>
                <td class="table__cell table__cell--actions">
                  <nav class="table__actions">
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
                  </nav>
                </td>
              </tr>
            </tbody>
          </table>

          <section class="contacts__empty-state" v-if="isEmpty">
            <img
              src="../assets/images/book.png"
              alt="Nenhum contato encontrado"
              class="contacts__empty-image"
            />
            <p class="contacts__empty-text">Ainda não há contatos</p>
            <BaseButton title="Adicionar contato" @click="openCreateForm" />
          </section>
        </section>

        <section v-if="showReports" class="reports">
          <header class="reports__header">
            <button class="reports__back-button" @click="goBackToContacts" aria-label="Voltar">
              ← Voltar
            </button>
          </header>

          <main class="reports__content">
            <h3 class="reports__title">Dados sobre contatos</h3>

            <section class="reports__charts">
              <article class="chart-section">
                <h4 class="chart-section__title">Segmentação por estado</h4>
                <div class="chart-container first-chart">
                  <div v-if="isLoadingCharts" class="chart-loading">
                    <Loader />
                    <span class="chart-loading__text">Carregando dados...</span>
                  </div>
                  <Pie v-else :data="stateChartData" :options="chartOptions" />
                </div>
              </article>

              <article class="chart-section">
                <h4 class="chart-section__title">Segmentação por cidade</h4>
                <div class="chart-container">
                  <div v-if="isLoadingCharts" class="chart-loading">
                    <Loader />
                    <span class="chart-loading__text">Carregando dados...</span>
                  </div>
                  <Pie v-else :data="cityChartData" :options="chartOptions" />
                </div>
              </article>
            </section>
          </main>
        </section>
      </section>
    </section>

    <ContactDialog
      :contact="selectedContact"
      :is-open="isDialogOpen"
      @close="closeContactDialog"
      @edit="openEditForm"
      @delete="openDeleteConfirm"
      @call="callContact"
    />

    <ConfirmDialog
      title="Excluir este contato?"
      :is-open="showConfirmDelete"
      :is-loading="isLoading"
      :is-destructive="true"
      @cancel="closeDeleteConfirm"
      @confirm="confirmDelete"
    />

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
/* Estilos globais para a página */
.contacts {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centraliza verticalmente o contêiner principal */
  align-items: center;
  background: var(--color-gray-100);
  padding: var(--spacing-md);
  box-sizing: border-box;
}

.contacts__center {
  width: 100%; /* Largura total */
  max-width: 930px; /* Limite em telas grandes */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 auto;
}

.contacts__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-lg);
  align-self: flex-start; /* Garante que o título não seja afetado pelo justify-content */
}

.contacts__actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  box-sizing: border-box;
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
  height: 928px; /* Altura fixa original, para manter o layout */
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-primary);
  background: var(--color-white);
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  min-width: 600px; /* Garante a rolagem horizontal em telas pequenas */
}

/* ... (O restante dos estilos da tabela, sem modificações) ... */

/* Estilos de tabela (mantidos) */
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

/* ... (demais estilos de tabela) ... */
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

.first-chart {
  margin-left: -30px;
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

@media (max-width: 768px) {
  .contacts {
    padding: var(--spacing-sm);
    justify-content: flex-start;
  }

  .contacts__center {
    padding: 0;
  }

  .contacts__title {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-md);
    padding: 0 var(--spacing-md);
  }

  .contacts__actions {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .contacts__buttons {
    width: 100%;
    justify-content: space-between;
  }

  .table__actions {
    opacity: 1;
    visibility: visible;
  }

  .table__contact-avatar {
    display: none;
  }

  .icon-button {
    background: var(--color-gray-200);
    border-radius: var(--border-radius-md);
    width: 44px;
  }

  .contacts__table-container {
    height: auto;
    border-radius: var(--border-radius-md);
  }

  .reports {
    padding: var(--spacing-md);
  }

  .reports__charts {
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .chart-container {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 60%;
    height: 250px;
    margin: 0 auto;
  }

  .chart-section {
    padding: 0;
  }
}

@media (max-width: 480px) {
  .contacts__buttons {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .contacts__buttons .base-button {
    width: 100%;
  }

  .icon-button {
    width: 100%;
  }

  .contacts__title {
    font-size: var(--font-size-base);
  }
}
</style>
