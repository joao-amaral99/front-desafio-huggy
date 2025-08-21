<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Loader from '@/components/ui/Loader.vue'

const isLoading = ref(false)
const router = useRouter()

const BACKEND_URL = 'http://localhost:8000/api'

const handleLogin = () => {
  isLoading.value = true

  const popup = window.open(
    `${BACKEND_URL}/oauth/huggy/redirect`,
    'Login com Huggy',
    'width=500,height=600,scrollbars=yes,resizable=yes',
  )

  const messageHandler = (event: MessageEvent) => {
    const { token } = event.data

    if (token) {
      localStorage.setItem('access_token', token)
      if (popup && !popup.closed) popup.close()
      router.push('/contacts')
    }

    isLoading.value = false
  }

  window.addEventListener('message', messageHandler, { once: true })

  const checkClosed = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkClosed)
      window.removeEventListener('message', messageHandler)
      isLoading.value = false
    }
  }, 1000)
}

const handleCallback = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const userData = urlParams.get('user')

  if (userData) {
    try {
      const user = JSON.parse(decodeURIComponent(userData))
      localStorage.setItem('user', JSON.stringify(user))
      router.push('/contacts')
    } catch (error) {
      console.error('Erro ao processar dados do usuário:', error)
    } finally {
      isLoading.value = false
    }
  }
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('user')) {
    handleCallback()
  }
})
</script>

<template>
  <main class="login">
    <h2 class="login__title">Login</h2>
    <form class="login__form" @submit.prevent="handleLogin">
      <button
        class="login__button"
        type="submit"
        :disabled="isLoading"
        :aria-busy="isLoading ? 'true' : 'false'"
        @click="handleLogin"
      >
        <span v-if="!isLoading">Fazer login com a Huggy</span>
        <Loader v-else />
      </button>
    </form>
  </main>
</template>

<style scoped>
.login {
  width: 100%;
  min-height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--color-gray-100);
}

.login__title {
  color: var(--color-text-primary, #222);
  text-align: center;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-normal);
}

.login__form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
}

.login__button {
  width: 220px;
  max-width: 100%;
  background-color: var(--color-primary);
  border: none;
  border-radius: var(--border-radius-md);
  min-width: 180px;
  height: 40px;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-white);
  gap: var(--spacing-xs);
  position: relative;
}

.login__button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.login__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login__button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .login__button {
    width: 100%;
    min-width: 0;
  }
}
</style>
