import { createRouter, createWebHistory } from 'vue-router'
import Demo from '../views/Demo.vue'
import Home from '../views/Home.vue'
import Measurements from '../views/Measurements.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/measurements',
    name: 'Measurements',
    component: Measurements
  },
  {
    path: '/demo',
    name: 'Demo',
    component: Demo
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
