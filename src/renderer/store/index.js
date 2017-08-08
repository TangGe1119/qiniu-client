import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';
import * as getters from './getters';
import mutations from './mutations';
import state from './state';

import createLogger from 'vuex/dist/logger';

Vue.use(Vuex);

let isDev = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    plugins: isDev ? [createLogger()] : [], // logger插件
    strict: isDev // 严格模式不允许直接修改state中的数据，只能通过mutation修改
});