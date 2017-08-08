import Vue from 'vue';
import message from '@/components/popup';

export default new Vue({
    created() {
        this.$on('message', msg => {
            message(msg)
        })
    }
})