import Vue from 'vue'
import Confirm from './Confirm'

const ConfirmComponent = Vue.extend(Confirm)

export default function({ title, content, loading, ok, cancel }) {
    const confirm = new ConfirmComponent({
        data: {
            title,
            content,
            loading
        },
        methods: { ok, cancel }
    })
    let $el = confirm.$mount().$el
    document.querySelector('body').appendChild($el)
}
