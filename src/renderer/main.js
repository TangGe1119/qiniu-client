import Vue from 'vue';
import axios from 'axios';

import iView from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView);

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});