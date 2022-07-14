import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '../views/mainPage/mainPage.vue'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: HomeView
  // },
  {
    path: '/InStock',
    name: 'InStock',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ './InStock.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
