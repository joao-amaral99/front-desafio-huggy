import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ContactsView from '@/views/ContactsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/contacts',
      name: 'Contacts',
      component: ContactsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  if (to.meta.requiresAuth) {
    if (!token) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    if (to.name === 'login' && token) {
      next({ name: 'Contacts' })
    } else {
      next()
    }
  }
})

export default router
