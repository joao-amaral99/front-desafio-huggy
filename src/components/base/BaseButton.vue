<script setup lang="ts">
interface Props {
  title?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Adicionar contato',
  disabled: false,
  variant: 'primary',
})
</script>

<template>
  <button
    class="base-button"
    :class="[`base-button--${props.variant}`, { 'base-button--disabled': props.disabled }]"
    type="button"
    :disabled="props.disabled"
    :aria-label="props.title"
  >
    <img src="@/assets/icons/add.svg" alt="" class="base-button__icon" />
    <span class="base-button__text">{{ props.title }}</span>
  </button>
</template>

<style scoped>
.base-button {
  width: 184px;
  height: var(--height-button);
  border: none;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition:
    background-color var(--transition-normal),
    opacity var(--transition-normal);
}

.base-button--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.base-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.base-button--secondary {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
}

.base-button--secondary:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.base-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.base-button__icon {
  width: 20px;
  height: 20px;
  display: inline-block;
}

.base-button__text {
  display: inline-block;
}
</style>
