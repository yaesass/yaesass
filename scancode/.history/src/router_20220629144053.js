import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '../views/mainPage/mainPage.vue'

Vue.use(VueRouter)

// const routes = [
//   // {
//   //   path: '/',
//   //   name: 'home',
//   //   component: HomeView
//   // },
//   {
//     path: '/InStock',
//     name: 'InStock',
//     // route level code-splitting
//     // this generates a separate chunk (about.[hash].js) for this route
//     // which is lazy-loaded when the route is visited.
//     component: () => import(/* webpackChunkName: "about" */ '../views/InStock.vue')
//   }
// ]


//引用page1页面
import InStock from '.InStock.vue';
//引用page2页面
// import page2 from './page2.vue';

//定义routes路由的集合，数组类型
const routes = [
  //单个路由均为对象类型，path代表的是路径，component代表组件
  { path: '/', component: InStock },
  // //或者重新写个路径为空的路由
  // { path: "", component: InStock }
  // { path: "/page2", component: page2 }
]


const router = new VueRouter({
  routes
})

export default router

