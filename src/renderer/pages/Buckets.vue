<template>
    <div class="buckets">
        <div v-for="item in buckets" class="bucket-item">
            <bucket @click="goDetail" :name="item"></bucket>
        </div>
        <div class="setting" @click="showSettingMoal">
            <Icon type="settings"></Icon>
        </div>
        <Modal
            v-model="settingModal"
            title="普通的Modal对话框标题">
            <h2 slot="header">基本设置</h2>
            <Form ref="form" :model="formItem" :label-width="100" :rules="ruleValidate">
                <Form-item label="AccessKey" prop="ak">
                    <Input v-model="formItem.ak" placeholder="AccessKey"></Input>
                </Form-item>
                <Form-item label="SecretKey" prop="sk">
                    <Input v-model="formItem.sk" placeholder="SecretKey"></Input>
                </Form-item>
                <Form-item label="下载路径" prop="downloadPath" style="position: relative;">
                    <Input disabled :value="formItem.downloadPath" placeholder="下载路径"></Input>
                    <Button @click="chooseFolder" style="position: absolute;top: 1px;right: 1px;">选择文件夹</Button>
                </Form-item>
            </Form>
            <div slot="footer">
                <Button size="large" @click="settingModal = false">取消</Button>
                <Button type="primary" size="large" @click="confirm">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import {mapGetters, mapActions} from 'vuex';
import Bucket from '@/components/Bucket/Bucket';
import storage from '../common/storage';
const {dialog} = require('electron').remote;

export default {
    data() {
        return {
            settingModal: false,
            formItem: {
                ak: '',
                sk: '',
                downloadPath: ''
            },
            ruleValidate: {
                ak: [{ required: true, message: 'AccessKey不能为空', trigger: 'blur' }],
                sk: [{ required: true, message: 'SecretKey不能为空', trigger: 'blur' }],
                downloadPath: [{ required: true, message: '下载路径不能为空', trigger: 'blur' }]
            }
        }
    },
    computed: {
        ...mapGetters([
            'buckets',
            'ak',
            'sk',
            'downloadPath'
        ])
    },
    mounted() {
        this.getBuckets().then(() => {
            this.formItem.ak = this.ak;
            this.formItem.sk = this.sk;
            this.formItem.downloadPath = this.downloadPath;
        }).catch(() => {
            this.$router.push('/nokey')
        });
    },
    methods: {
        ...mapActions([
            'getBuckets',
            'setDownloadPath',
            'setKeys'
        ]),
        goDetail(name) {
            this.$router.push({
                name: 'bucketDetail',
                params: {
                    name
                }
            })
        },
        showSettingMoal() {
            this.settingModal = true;
        },
        confirm() {
            this.setKeys({
                ak: this.formItem.ak,
                sk: this.formItem.sk
            }).then(() => {
                this.setDownloadPath(this.formItem.downloadPath);
                this.settingModal = false;
            }).catch(e => {
                this.formItem.ak = this.ak;
                this.formItem.sk = this.sk;
                this.formItem.downloadPath = this.downloadPath;
                this.$Notice.error({
                    title: '输入的秘钥有误'
                });
            })
        },
        chooseFolder() {
            let path = dialog.showOpenDialog({defaultPath: this.downloadPath, properties: ['openDirectory']});
            if(path) {
                this.formItem.downloadPath = path[0];
            }
        }
    },
    components: {
        Bucket
    }
}
</script>
<style>
.buckets {
    position: relative;
    height: 100%;
}
.buckets .bucket-item {
    width: 160px;
}
.buckets .setting {
    font-size: 50px;
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 50%;
    position: absolute;
    bottom: 50px;
    right: 50px;
    cursor: pointer;
}
.buckets .setting:hover {
    color: #2d8cf0;
    border: 1px solid #2d8cf0;
}
</style>