import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/pay/reserve',
    name: 'reserve',
    component: () => import('../views/Reserve.vue')
  },
  {
    path: '/pay/confirm',
    name: 'confirm',
    component: () => import('../views/Confirm.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
