<script setup lang="ts">
import { ref, watch } from 'vue'
import Loader from '@/components/ui/Loader.vue'
import { vMaska } from 'maska/vue'

interface Contact {
  id?: number
  name: string
  email: string
  phone: string
  mobile: string
  address: string
  district: string
  city?: string
  state: string
}

interface Props {
  isOpen: boolean
  isEditing: boolean
  contact?: Contact | null
  isLoading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', contact: Contact): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})
const emit = defineEmits<Emits>()

const formData = ref<Contact>({
  name: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  district: '',
  city: '',
  state: '',
})

const errors = ref({
  name: false,
  email: false,
  phone: false,
  mobile: false,
})

const clearAllErrors = () => {
  errors.value.name = false
  errors.value.email = false
  errors.value.phone = false
  errors.value.mobile = false
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    district: '',
    city: '',
    state: '',
  }
  clearAllErrors()
}

watch(
  () => props.contact,
  (newContact) => {
    if (newContact && props.isEditing) {
      formData.value = { ...newContact }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      clearAllErrors()
    }
  },
)

const closeDialog = () => {
  emit('close')
}

const validateForm = () => {
  errors.value.name = !formData.value.name.trim()
  errors.value.email = !formData.value.email.trim()
  errors.value.phone = !formData.value.phone.trim()
  errors.value.mobile = !formData.value.mobile.trim()

  return !Object.values(errors.value).some((error) => error)
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('save', { ...formData.value })
    resetForm()
  }
}

const clearError = (field: keyof typeof errors.value) => {
  errors.value[field] = false
}
</script>

<template>
  <div v-if="isOpen" class="form-overlay" @click="closeDialog">
    <article class="form-dialog" @click.stop>
      <header class="form-dialog__header">
        <h2 class="form-dialog__title">
          {{ isEditing ? 'Editar contato' : 'Adicionar novo contato' }}
        </h2>
      </header>

      <div class="form-dialog__divider"></div>

      <main class="form-dialog__form" @submit.prevent="handleSubmit">
        <section class="form-dialog__field">
          <label class="form-dialog__label" for="name">Nome</label>
          <input
            id="name"
            v-model="formData.name"
            :class="[
              'form-dialog__input',
              'form-dialog__input--large',
              { 'form-dialog__input--error': errors.name },
            ]"
            type="text"
            placeholder="Nome completo"
            required
            @input="clearError('name')"
          />
          <span v-if="errors.name" class="form-dialog__error">Campo obrigatório</span>
        </section>

        <section class="form-dialog__field">
          <label class="form-dialog__label" for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            :class="[
              'form-dialog__input',
              'form-dialog__input--large',
              { 'form-dialog__input--error': errors.email },
            ]"
            type="email"
            placeholder="Email"
            required
            @input="clearError('email')"
          />
          <span v-if="errors.email" class="form-dialog__error">Campo obrigatório</span>
        </section>

        <section class="form-dialog__field">
          <label class="form-dialog__label" for="phone">Telefone</label>
          <input
            id="phone"
            v-model="formData.phone"
            v-maska="'55 ######-####'"
            :class="[
              'form-dialog__input',
              'form-dialog__input--medium',
              { 'form-dialog__input--error': errors.phone },
            ]"
            type="tel"
            placeholder="774002-8922"
            required
            @input="clearError('phone')"
          />
          <span v-if="errors.phone" class="form-dialog__error">Campo obrigatório</span>
        </section>

        <section class="form-dialog__field">
          <label class="form-dialog__label" for="mobile">Celular</label>
          <input
            id="mobile"
            v-model="formData.mobile"
            v-maska="'55 #######-####'"
            :class="[
              'form-dialog__input',
              'form-dialog__input--medium',
              { 'form-dialog__input--error': errors.mobile },
            ]"
            type="tel"
            placeholder="7798888-9999"
            required
            @input="clearError('mobile')"
          />
          <span v-if="errors.mobile" class="form-dialog__error">Campo obrigatório</span>
        </section>

        <section class="form-dialog__field">
          <label class="form-dialog__label" for="address">Endereço</label>
          <input
            id="address"
            v-model="formData.address"
            class="form-dialog__input form-dialog__input--xlarge"
            type="text"
            placeholder="Endereço"
          />
        </section>

        <section class="form-dialog__field-row">
          <section class="form-dialog__field form-dialog__field--third">
            <label class="form-dialog__label" for="district">Bairro</label>
            <input
              id="district"
              v-model="formData.district"
              class="form-dialog__input form-dialog__input--flexible"
              type="text"
              placeholder="Bairro"
            />
          </section>
          <section class="form-dialog__field form-dialog__field--third">
            <label class="form-dialog__label" for="city">Cidade</label>
            <input
              id="city"
              v-model="formData.city"
              class="form-dialog__input form-dialog__input--flexible"
              type="text"
              placeholder="Cidade"
            />
          </section>
          <section class="form-dialog__field form-dialog__field--third">
            <label class="form-dialog__label" for="state">Estado</label>
            <input
              id="state"
              v-model="formData.state"
              class="form-dialog__input form-dialog__input--flexible"
              type="text"
              placeholder="Estado"
            />
          </section>
        </section>
      </main>

      <div class="form-dialog__divider"></div>

      <footer class="form-dialog__actions">
        <button
          class="form-dialog__btn form-dialog__btn--cancel"
          type="button"
          :disabled="props.isLoading"
          @click="closeDialog"
        >
          Cancelar
        </button>
        <button
          class="form-dialog__btn form-dialog__btn--save"
          type="button"
          :disabled="props.isLoading"
          @click="handleSubmit"
        >
          <span v-if="!props.isLoading"> Salvar </span>
          <Loader v-else />
        </button>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-dialog {
  width: 610px;
  min-height: 650px;
  max-height: 90vh;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-dialog);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-dialog__header {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md) var(--spacing-lg);
}

.form-dialog__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  letter-spacing: 0.15px;
  color: var(--color-text-primary);
  margin: 0;
}

.form-dialog__divider {
  height: 1px;
  background-color: var(--color-border-primary);
  margin: 0;
}

.form-dialog__form {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow-y: auto;
}

.form-dialog__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-dialog__field-row {
  display: flex;
  gap: var(--spacing-lg);
  align-items: end;
}

.form-dialog__field--half {
  flex: 0 0 250px;
}

.form-dialog__field--third {
  flex: 1;
  min-width: 130px;
}

.form-dialog__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.form-dialog__input {
  height: var(--height-input);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-primary);
  border: 1px solid var(--color-border-primary);
  padding: 0 var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition:
    border-color var(--transition-normal),
    background-color var(--transition-normal);
}

.form-dialog__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  background-color: var(--color-white);
}

.form-dialog__input::placeholder {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-placeholder);
}

.form-dialog__input--error {
  border-color: var(--color-error) !important;
}

.form-dialog__input--error:focus {
  border-color: var(--color-error) !important;
}

.form-dialog__error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  display: block;
}

.form-dialog__input--large {
  width: 350px;
}

.form-dialog__input--medium {
  width: 250px;
}

.form-dialog__input--small {
  width: 150px;
}

.form-dialog__input--xlarge {
  width: 450px;
}

.form-dialog__input--flexible {
  width: 100%;
}

.form-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
}

.form-dialog__btn {
  height: var(--height-button);
  padding: 0 var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.form-dialog__btn:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.form-dialog__btn--cancel {
  background: transparent;
  color: var(--color-text-secondary);
}

.form-dialog__btn--cancel:hover:not(:disabled) {
  background-color: var(--color-gray-100);
  color: var(--color-text-primary);
}

.form-dialog__btn--save {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.form-dialog__btn--save:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.form-dialog__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-overlay {
  animation: fadeIn 0.2s ease-out;
}

.form-dialog {
  animation: slideIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 768px) {
  .form-dialog {
    width: 95%;
    min-height: auto;
    max-height: 95vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
  }

  .form-dialog__field-row {
    flex-direction: column;
    gap: 0;
  }

  .form-dialog__input--large,
  .form-dialog__input--medium,
  .form-dialog__input--small,
  .form-dialog__input--xlarge,
  .form-dialog__input--flexible {
    width: 100%;
  }

  .form-dialog__field-row .form-dialog__field {
    width: 100%;
    margin-bottom: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .form-dialog {
    width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }
}
</style>
