import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '../views/mainPage/mainPage.vue'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '/mainPage',
  //   name: 'home',
  //   component: HomeView
  // },
  {
    path: '/InStock/index.vue',
    name: 'InStock',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/InStock/index.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
