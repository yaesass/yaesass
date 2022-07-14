import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'

// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'
Vue.use(ElementUI);
Vue.config.productionTip = false
Vue.prototype.$axios = axios
new Vue({
  el: '#app',
  axios,
  router,
  render: h => h(App)
}).$mount('#app')
