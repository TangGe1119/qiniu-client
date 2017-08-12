<template>
    <div class="no-key">
        <h2>您还没有配置过秘钥</h2>
        <Button @click="dialog = true" type="primary">点击配置</Button>
        <Modal
            v-model="dialog"
            title="设置秘钥"
            :mask-closable="false">
            <Form ref="form" :model="formItem" :label-width="100" :rules="ruleValidate">
                <Form-item label="AccessKey" prop="ak">
                    <Input v-model="formItem.ak" placeholder="AccessKey"></Input>
                </Form-item>
                <Form-item label="SecretKey" prop="sk">
                    <Input v-model="formItem.sk" placeholder="SecretKey"></Input>
                </Form-item>
            </Form>
            <div slot="footer">
                <Button size="large" @click="close">取消</Button>
                <Button type="primary" size="large" @click="confirm">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import { mapActions, mapGetters } from 'vuex';
    export default {
        data() {
            return {
                dialog: false,
                formItem: {
                    ak: '',
                    sk: ''
                },
                ruleValidate: {
                    ak: [{ required: true, message: 'AccessKey不能为空', trigger: 'blur' }],
                    sk: [{ required: true, message: 'SecretKey不能为空', trigger: 'blur' }]
                }
            }
        },
        computed: {
            ...mapGetters([
                'ak',
                'sk'
            ])
        },
        methods: {
            ...mapActions([
                'setKeys'
            ]),
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
                this.$refs['form'].validate((valid) => {
                    if(!valid) return;
                    this.setKeys({
                        ak: this.formItem.ak,
                        sk: this.formItem.sk
                    }).then(() => {
                        this.dialog = false;
                        this.$router.push('/buckets')
                    }).catch(e => {
                        this.$Notice.error({
                            title: '输入的秘钥有误'
                        });
                    });
                })
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