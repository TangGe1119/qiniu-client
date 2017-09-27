<template>
    <Modal v-model="modal" :title="title" :loading="loading" :closable="false" :mask-closable="false" @on-ok="onOk" @on-cancel="onCancel">  
        <p>{{content}}</p>
    </Modal>
</template>
<script>
export default {
    data () {
        return {
            title: '',
            content: '',
            modal: false,
            loading: false
        };
    },
    mounted() {
        this.modal = true
    },
    destroyed() {
        this.$el.remove()
    },
    methods: {
        ok() {
            throw new Error('confirm method must has a ok method argument')
        },
        cancel() {
            throw new Error('confirm method must has a cancel method argument')
        },
        onOk() {
            this.ok(this._close)
        },
        onCancel() {
            this.cancel(this._close)
        },
        _close() {
            this.modal = false
            setTimeout(() => {
                this.$destroy()
            }, 300)
        }
    }
}
</script>
<style scoped>

</style>