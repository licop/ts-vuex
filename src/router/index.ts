import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import Count from '@/views/Counter.vue'
import Cart from '@/views/Cart.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/count',
    name: 'count',
    component: Count,
  },
  // {
  //   path: '/cart',
  //   name: 'Cart',
  //   component: Cart
  // },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
  
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
