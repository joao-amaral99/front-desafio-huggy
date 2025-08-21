<script setup lang="ts"></script>

<template>
  <div class="loader" aria-label="Carregando" role="status"></div>
</template>

<style scoped>
.loader {
  animation: loading 1s linear infinite;
  width: 20px;
  height: 20px;
  background: none;
  border: 2px solid var(--color-white);
  border-top-color: transparent;
  border-radius: 50%;
  margin: 0 auto;
}

@keyframes loading {
  to {
    transform: rotate(1turn);
  }
}
</style>
