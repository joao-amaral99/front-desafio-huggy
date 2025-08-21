<script setup lang="ts">
import Loader from '@/components/ui/Loader.vue'

interface Props {
  title: string
  isOpen: boolean
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

interface Emits {
  (e: 'cancel'): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Excluir',
  cancelText: 'Cancelar',
  isDestructive: false,
  isLoading: false,
})

const emit = defineEmits<Emits>()

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <div v-if="isOpen" class="confirm-overlay" @click="handleCancel">
    <article class="confirm-dialog" @click.stop>
      <header>
        <h2 class="confirm-dialog__title">{{ title }}</h2>
      </header>
      <footer class="confirm-dialog__actions">
        <button
          class="confirm-dialog__btn confirm-dialog__btn--cancel"
          type="button"
          :disabled="props.isLoading"
          @click="handleCancel"
        >
          {{ props.cancelText }}
        </button>
        <button
          class="confirm-dialog__btn"
          :class="
            props.isDestructive
              ? 'confirm-dialog__btn--destructive'
              : 'confirm-dialog__btn--confirm'
          "
          type="button"
          :disabled="props.isLoading"
          @click="handleConfirm"
        >
          <span v-if="!props.isLoading">{{ props.confirmText }}</span>
          <Loader v-else />
        </button>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirm-dialog {
  width: 360px;
  min-height: 144px;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-dialog);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  box-sizing: border-box;
}

.confirm-dialog__title {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  line-height: 1.4;
  letter-spacing: 0.15px;
  font-weight: var(--font-weight-medium);
  margin: 0;
  flex: 1;
  display: flex;
  align-items: center;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: auto;
}

.confirm-dialog__btn {
  height: var(--height-button);
  padding: 0 var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: none;
  background: transparent;
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

.confirm-dialog__btn:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.confirm-dialog__btn--cancel {
  color: var(--color-text-secondary);
}

.confirm-dialog__btn--cancel:hover {
  background-color: var(--color-gray-100);
  color: var(--color-text-primary);
}

.confirm-dialog__btn--confirm {
  color: var(--color-primary);
}

.confirm-dialog__btn--confirm:hover {
  background-color: var(--color-gray-100);
}

.confirm-dialog__btn--destructive {
  color: var(--color-error);
}

.confirm-dialog__btn--destructive:hover {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.confirm-overlay {
  animation: fadeIn 0.2s ease-out;
}

.confirm-dialog {
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
</style>
