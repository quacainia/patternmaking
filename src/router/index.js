import { createRouter, createWebHistory } from 'vue-router'
import Demo from '../views/Demo.vue'
import Home from '../views/Home.vue'
import Draft from '../views/Draft.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/draft/:draftId',
    name: 'Draft',
    component: Draft,
  },
  {
    path: '/draft/:draftId/step/:stepId',
    component: Draft,
  },
  {
    path: '/draft/:draftId/complete',
    component: Draft,
    props: {
      complete: true,
    },
  },
  {
    path: '/demo',
    name: 'Demo',
    component: Demo,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
