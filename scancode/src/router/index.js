import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '../views/mainPage/mainPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
  },
  {
    path: '/InStock',
    name: 'InStock',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/InStock.vue')
  }, {
    path: '/InStockDetail',
    name: 'InStockDetail',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/InStockDetail.vue')
  }, {
    path: '/OutStock',
    name: 'OutStock',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/OutStock.vue')
  }, {
    path: '/OutStockDetail',
    name: 'OutStockDetail',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/OutStockDetail.vue')
  }


]


const router = new VueRouter({
  routes
})

export default router

