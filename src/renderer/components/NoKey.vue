<template>
    <div class="no-key">
        <h2>您还没有配置过秘钥</h2>
        <mu-raised-button @click="showKeyDialog" label="点击配置" class="demo-raised-button" primary/>
        <mu-dialog dialogClass="keyDialog" :open="dialog" title="设置秘钥" @close="close">
            <mu-text-field @blur="check('accessKey')" v-model="accessKey" :error-text="accessKeyErr" label="AccessKey" labelFloat/><br/>
            <mu-text-field @blur="check('secretKey')" v-model="secretKey" :error-text="secretKeyErr" required label="SecretKey" labelFloat/><br/>
            <mu-flat-button slot="actions" @click="close" primary label="取消"/>
            <mu-flat-button slot="actions" primary @click="confirm" label="确定"/>
        </mu-dialog>
    </div>
</template>
<script>
    import { mapActions } from 'vuex';
    export default {
        data() {
            return {
                dialog: false,
                accessKey: '',
                secretKey: '',
                accessKeyErr: '',
                secretKeyErr: ''
            }
        },
        methods: {
            ...mapActions([
                'setKeys'
            ]),
            showKeyDialog() {
                this.dialog = true;
            },
            close() {
                this.dialog = false;
            },
            check(key) {
                if(!this[key]) {
                    this[`${key}Err`] = '这是必填项';
                }else {
                    this[`${key}Err`] = '';
                }
            },
            confirm() {
                if(this.accessKeyErr || this.secretKeyErr) return;
                this.setKeys({
                    accessKey: this.accessKey,
                    secretKey: this.secretKey
                });
                this.dialog = false;
            }
        }
    }
</script>
<style>
.no-key {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.no-key h2 {
    margin: 0;
    text-align: center;
    padding: 20px;
}
.no-key .mu-raised-button {
    width: 120px;
}
.keyDialog .mu-text-field {
    width: 100%;
}
.keyDialog {
    width: 430px;
}
</style>