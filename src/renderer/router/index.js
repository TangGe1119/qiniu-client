import Vue from 'vue'
import Router from 'vue-router'
import storage from '../common/storage'

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/',
            redirect: '/bucket/0'
        },
        {
            path: '/bucket/:id',
            component: require('@/pages/Layout')
        },
        {
            path: '/nokey',
            component: require('@/pages/NoKey')
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.path !== '/nokey' && (!storage.get('AK') || !storage.get('SK'))) {
        // 非/nokey路径重定向
        next({ path: '/nokey' })
    }
    next()
})

export default router
