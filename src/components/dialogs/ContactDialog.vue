<script setup lang="ts">
import { toRefs } from 'vue'
import type { Contact } from '@/services/contactService'

const props = defineProps<{
  contact: Contact | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: [contact: Contact]
  delete: [contact: Contact]
  call: [contact: Contact]
}>()

const { contact, isOpen } = toRefs(props)

const closeDialog = () => {
  emit('close')
}

const editContact = () => {
  if (contact.value) {
    emit('edit', contact.value)
  }
}

const deleteContact = () => {
  if (contact.value) {
    emit('delete', contact.value)
  }
}

const callContact = () => {
  if (contact.value) {
    emit('call', contact.value)
  }
}
</script>

<template>
  <div v-if="isOpen" class="dialog-overlay" @click="closeDialog">
    <article class="dialog" @click.stop>
      <header class="dialog__header">
        <section class="dialog__contact-info">
          <div class="dialog__contact-avatar">
            <template v-if="contact?.photo">
              <img :src="contact?.photo" :alt="contact?.name" class="dialog__contact-photo" />
            </template>
            <template v-else>
              <span class="dialog__contact-initials">{{ contact?.initials }}</span>
            </template>
          </div>
          <h3 class="dialog__contact-name">{{ contact?.name }}</h3>
        </section>
        <nav class="dialog__actions">
          <button
            class="dialog__action-btn"
            type="button"
            aria-label="Ligar para o contato"
            @click="callContact"
          >
            <img src="../../assets/icons/phone.svg" alt="Ligar" />
          </button>
          <button
            class="dialog__action-btn"
            type="button"
            aria-label="Excluir contato"
            @click="deleteContact"
          >
            <img src="../../assets/icons/delete.svg" alt="Excluir" />
          </button>
          <button
            class="dialog__action-btn"
            type="button"
            aria-label="Editar contato"
            @click="editContact"
          >
            <img src="../../assets/icons/edit.svg" alt="Editar" />
          </button>
          <button class="dialog__action-btn" type="button" aria-label="Fechar" @click="closeDialog">
            <img src="../../assets/icons/close.svg" alt="Fechar" />
          </button>
        </nav>
      </header>

      <div class="dialog__divider"></div>

      <main class="dialog__content">
        <section class="dialog__field">
          <label class="dialog__label">Email</label>
          <p class="dialog__value">{{ contact?.email ?? 'Não informado' }}</p>
        </section>
        <section class="dialog__field">
          <label class="dialog__label">Endereço</label>
          <p class="dialog__value">{{ contact?.address ?? 'Não informado' }}</p>
        </section>
        <section class="dialog__field">
          <label class="dialog__label">Telefone</label>
          <p class="dialog__value">{{ contact?.phone ?? 'Não informado' }}</p>
        </section>
        <section class="dialog__field">
          <label class="dialog__label">Celular</label>
          <p class="dialog__value">{{ contact?.mobile ?? 'Não informado' }}</p>
        </section>
        <section class="dialog__field">
          <label class="dialog__label">Bairro</label>
          <p class="dialog__value">{{ contact?.district ?? 'Não informado' }}</p>
        </section>
        <section class="dialog__field">
          <label class="dialog__label">Cidade</label>
          <p class="dialog__value">{{ contact?.city ?? 'Não informado' }}</p>
        </section>
        <section class="dialog__field">
          <label class="dialog__label">Estado</label>
          <p class="dialog__value">{{ contact?.state ?? 'Não informado' }}</p>
        </section>
      </main>
    </article>
  </div>
</template>

<style scoped>
.dialog-overlay {
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

.dialog {
  width: 610px;
  min-height: 312px;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-dialog);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--color-white);
}

.dialog__contact-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.dialog__contact-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-background-avatar);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog__contact-initials {
  color: var(--color-primary);
  font-weight: 500;
  font-size: var(--font-size-base);
  background-color: var(--color-background-avatar);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog__contact-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.dialog__contact-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin: 0;
  line-height: 1.5;
}

.dialog__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog__action-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-normal);
  padding: 0;
}

.dialog__action-btn:hover {
  background-color: var(--color-gray-100);
}

.dialog__action-btn:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.dialog__action-btn img {
  width: 20px;
  height: 20px;
  display: block;
}

.dialog__divider {
  height: 1px;
  background-color: var(--color-border-primary);
  margin: 0;
}

.dialog__content {
  padding: var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.dialog__field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-lg);
}

.dialog__label {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1.3;
  letter-spacing: 0.4px;
  text-align: right;
  min-width: 80px;
  flex-shrink: 0;
}

.dialog__value {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: 18px;
  letter-spacing: 0.25px;
  margin: 0;
}

.dialog-overlay {
  animation: fadeIn 0.2s ease-out;
}
.dialog {
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
  .dialog {
    width: 90%;
    max-height: 90vh;
  }

  .dialog__header {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .dialog__contact-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .dialog__contact-name {
    font-size: var(--font-size-lg);
  }

  .dialog__actions {
    width: 100%;
    justify-content: center;
    margin-top: var(--spacing-md);
  }

  .dialog__field {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .dialog__label {
    text-align: left;
    min-width: auto;
    width: 100%;
  }

  .dialog__value {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dialog {
    width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }
}
</style>
