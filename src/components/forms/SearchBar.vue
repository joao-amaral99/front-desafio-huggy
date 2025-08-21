<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Buscar contato',
})

const emit = defineEmits<Emits>()

const value = computed({
  get: () => props.modelValue,
  set: (newValue: string) => emit('update:modelValue', newValue),
})
</script>

<template>
  <label class="search-bar__label">
    <div class="search-bar">
      <img src="@/assets/icons/search.svg" alt="Buscar" class="search-bar__icon" />
      <input
        v-model="value"
        class="search-bar__input"
        type="text"
        :placeholder="props.placeholder"
        :aria-label="props.placeholder"
      />
    </div>
  </label>
</template>

<style scoped>
.search-bar {
  width: 250px;
  height: var(--height-input);
  display: flex;
  align-items: center;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-sm);
  box-sizing: border-box;
  transition: border-color var(--transition-normal);
}

.search-bar:focus-within {
  border-color: var(--color-border-focus);
}

.search-bar__icon {
  width: 18px;
  height: 18px;
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
}

.search-bar__input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  height: 100%;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
}

.search-bar__input::placeholder {
  color: var(--color-text-placeholder);
}
</style>
