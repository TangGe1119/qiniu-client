import Vue from 'vue'
import Router from 'vue-router'
import storage from '../common/storage';

Vue.use(Router)

const router =  new Router({
    routes: [
        {
            path: '/',
            component: require('@/pages/Buckets')
        },
        {
            path: '/nokey',
            component: require('@/pages/NoKey')
        },
        {
            name: 'bucketDetail',
            path: '/bucket-detail/:name',
            component: require('@/pages/BucketDetail')
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})

router.beforeEach((to, from, next) => {
    if ((to.path !== '/nokey') && (!storage.get('AK') || !storage.get('SK'))) {
        // 非/nokey路径重定向
        next({path: '/nokey'});
    }
    next();
})

export default router;