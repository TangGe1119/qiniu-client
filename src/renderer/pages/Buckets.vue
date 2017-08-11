<template>
    <div class="buckets">
        <div v-for="item in buckets" class="bucket-item">
            <bucket @click="goDetail" @contextMenu="showContextMenu" :name="item"></bucket>
        </div>
        <div class="setting" @click="showSettingMoal">
            <Icon type="settings"></Icon>
        </div>
        <div class="addIcon" @click="addBucket">
            <Icon type="plus"></Icon>
        </div>
        <Modal v-model="settingModal">
            <h2 slot="header">基本设置</h2>
            <Form ref="settingForm" :model="settingForm" :label-width="100" :rules="settingRule">
                <Form-item label="AccessKey" prop="ak">
                    <Input v-model="settingForm.ak" placeholder="AccessKey"></Input>
                </Form-item>
                <Form-item label="SecretKey" prop="sk">
                    <Input v-model="settingForm.sk" placeholder="SecretKey"></Input>
                </Form-item>
                <Form-item label="下载路径" prop="downloadPath" style="position: relative;">
                    <Input disabled :value="settingForm.downloadPath" placeholder="下载路径"></Input>
                    <Button @click="chooseFolder" style="position: absolute;top: 1px;right: 1px;">选择文件夹</Button>
                </Form-item>
            </Form>
            <div slot="footer">
                <Button size="large" @click="settingModal = false">取消</Button>
                <Button type="primary" size="large" @click="confirmSetting">确定</Button>
            </div>
        </Modal>
        <Modal v-model="addModal">
            <h2 slot="header">新建Bucket</h2>
            <Form ref="addForm" :model="addForm" :label-width="100" :rules="addRule">
                <Form-item label="空间名称" prop="bucket">
                    <Input v-model="addForm.bucket" placeholder="请输入Bucket的名称"></Input>
                </Form-item>
                <Form-item label="存储区域" prop="region">
                    <Select v-model="addForm.region">
                        <Option value="default" key="default">默认</Option>
                        <Option value="z0" key="z0">华东</Option>
                        <Option value="z1" key="z1">华北</Option>
                        <Option value="z2" key="z2">华南</Option>
                        <Option value="na0" key="na0">北美</Option>
                    </Select>
                </Form-item>
            </Form>
            <div slot="footer">
                <Button size="large" @click="addModal = false">取消</Button>
                <Button type="primary" size="large" @click="confirmAdd">确定</Button>
            </div>
        </Modal>
        <context-menu 
            @remove="remove" 
            :top="top" 
            :left="left" 
            v-if="contextShow">
        </context-menu>
    </div>
</template>
<script>
import {mapGetters, mapActions} from 'vuex';
import Bucket from '@/components/Bucket/Bucket';
import storage from '../common/storage';
import ContextMenu from '@/components/ContextMenu/ContextMenu';
const {dialog} = require('electron').remote;

export default {
    data() {
        return {
            settingModal: false,
            contextShow: false,
            addModal: false,
            top: 0,
            left: 0,
            currentBucket: '',
            settingForm: {
                ak: '',
                sk: '',
                downloadPath: ''
            },
            settingRule: {
                ak: [{ required: true, message: 'AccessKey不能为空', trigger: 'blur' }],
                sk: [{ required: true, message: 'SecretKey不能为空', trigger: 'blur' }],
                downloadPath: [{ required: true, message: '下载路径不能为空', trigger: 'blur' }]
            },
            addForm: {
                bucket: '',
                region: 'default'
            },
            addRule: {
                bucket: [
                    { required: true, message: '空间名称不能为空', trigger: 'blur' },
                    { pattern: /^[\w\-]/, message: '空间名称只能为字母、短划线-、下划线_、数字组合', trigger: 'blur' },
                ],
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
        document.querySelector('body').addEventListener('click', e => {
            this.contextShow = false;
        });
        document.querySelector('body').addEventListener('contextmenu', e => {
            if(e.target.dataset.type !== 'bucket') {
                this.contextShow = false;
            }
        });
        // if(this.buckets && this.buckets.length > 0) return;
        this.getBuckets().then(() => {
            this.settingForm.ak = this.ak;
            this.settingForm.sk = this.sk;
            this.settingForm.downloadPath = this.downloadPath;
        }).catch(() => {
            this.$router.push('/nokey');
        });
    },
    methods: {
        ...mapActions([
            'getBuckets',
            'setDownloadPath',
            'setKeys',
            'createBucket',
            'removeBucket'
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
        confirmSetting() {
            this.$refs['settingForm'].validate((valid) => {
                if (!valid) {
                    this.settingForm.ak = this.ak;
                    this.settingForm.sk = this.sk;
                    return;
                }
                this.setKeys({
                    ak: this.settingForm.ak,
                    sk: this.settingForm.sk
                }).then(() => {
                    this.setDownloadPath(this.settingForm.downloadPath);
                    this.settingModal = false;
                }).catch(e => {
                    this.settingForm.ak = this.ak;
                    this.settingForm.sk = this.sk;
                    this.settingForm.downloadPath = this.downloadPath;
                    this.$Notice.error({
                        title: '输入的秘钥有误'
                    });
                })
            });
        },
        chooseFolder() {
            let path = dialog.showOpenDialog({defaultPath: this.downloadPath, properties: ['openDirectory']});
            if(path) {
                this.settingForm.downloadPath = path[0];
            }
        },
        showContextMenu({bucket, e}) {
            this.contextShow = true;
            this.left = e.clientX;
            this.top = e.clientY;
            this.currentBucket = bucket;
        },
        addBucket() {
            this.addModal = true;
        },
        remove() {
            this.removeBucket({bucket: this.currentBucket}).then(() => {
                this.$Notice.success({
                    title: `空间${this.currentBucket}删除成功`
                });
                this.getBuckets();
            }).catch(e => {
                this.$Notice.error({
                    title: '空间删除失败'
                });
            });
        },
        confirmAdd() {
            this.$refs['addForm'].validate((valid) => {
                if(!valid) return;
                let {bucket, region} = this.addForm;
                this.createBucket({
                    bucket,
                    region: region === 'default' ? '' : region
                }).then(() => {
                    this.addModal = false;
                    this.$Notice.success({
                        title: `空间${bucket}创建成功`
                    });
                    this.getBuckets();
                }).catch(e => {
                    console.log(e)
                });
            });
        }
    },
    components: {
        Bucket,
        ContextMenu
    }
}
</script>
<style>
.buckets {
    position: relative;
    height: 100%;
    overflow: hidden;
}
.buckets .bucket-item {
    display: inline-block;
    width: 160px;
}
.buckets .setting {
    font-size: 40px;
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 50%;
    position: absolute;
    bottom: 10px;
    right: 10px;
    cursor: pointer;
}
.buckets .addIcon {
    font-size: 40px;
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 50%;
    position: absolute;
    bottom: 90px;
    right: 10px;
    cursor: pointer;
}
.buckets .setting:hover, .buckets .addIcon:hover {
    color: #2d8cf0;
    border: 1px solid #2d8cf0;
    transform: scale(1.1);
    transition: all .1s ease-in-out;
}
</style>