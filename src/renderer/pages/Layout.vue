<template>
    <div class="layout">
        <div class="left-menu">
            <Menu :active-name="activeMenu" @on-select="selectMenuItem" theme="dark" width="200">
                <MenuItem v-for="(item, index) in buckets" :key="index" :name="index">
                    <Icon type="ios-folder" :size="20"></Icon>
                    <span class="layout-text">{{ item }}</span>
                    <Icon @click.native.stop="remove(item, index)" class="del-bucket-btn" type="ios-close-empty" :size="22"></Icon>
                </MenuItem>
            </Menu>
            <p style="text-align: center;margin-top: 15px;">
                <Icon @click.native="addBucket" type="ios-plus-outline" class="add-icon" :size="26"></Icon>
            </p>
            <Icon @click.native="showSettingMoal" title="基本设置" class="setting-icon" type="ios-gear" :size="32"></Icon>
        </div>
        <div class="right-content">
            <bucket-detail :name="currentBucket"></bucket-detail>
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
                    <Button @click.stop="chooseFolder" style="position: absolute;top: 1px;right: 1px;">选择文件夹</Button>
                </Form-item>
            </Form>
            <div slot="footer">
                <Button size="large" @click.stop="settingModal = false">取消</Button>
                <Button type="primary" size="large" @click.stop="confirmSetting">确定</Button>
            </div>
        </Modal>
        <Modal v-model="addModal" :closable="false" :mask-closable="false" :loading="true" @on-ok="confirmAdd">
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
        </Modal>
    </div>
</template>
<script>
import {mapGetters, mapActions} from 'vuex';
import BucketDetail from '../components/BucketDetail/BucketDetail'
import storage from '../common/storage';
import confirm from '../components/Confirm'

const {dialog} = require('electron').remote;

export default {
    data() {
        return {
            settingModal: false,
            addModal: false,
            activeMenu: '',
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
        ]),
        currentBucket() {
            return this.buckets[+this.$route.params.id]
        }
    },
    watch: {
        '$route.params.id'(newId) {
            this.activeMenu = +newId
        }
    },
    mounted() {
        this.getBuckets().then(() => {
            this.settingForm.ak = this.ak;
            this.settingForm.sk = this.sk;
            this.settingForm.downloadPath = this.downloadPath;
            this.$nextTick(() => {
                this.activeMenu = +this.$route.params.id
            })
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
        selectMenuItem(index) {
            this.$router.replace(`/bucket/${index}`)
        },
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
        addBucket() {
            this.addModal = true;
        },
        remove(bucket, index) {
            confirm({
                title: '删除Bucket',
                content: `此操作将删除${bucket}中的所有数据，且无法恢复，是否确认删除？`,
                loading: true,
                ok: (_close) => {
                    this.removeBucket({bucket}).then(() => {
                        this.$Notice.success({
                            title: `空间${bucket}删除成功`
                        });
                        return this.getBuckets();
                    }).then(buckets => {
                        _close()
                        // 如果选中的bucket被删除了 那么就跳转到第一个
                        if(index === +this.$route.params.id) {
                            this.$router.replace('/bucket/0')
                        }else if(index < +this.$route.params.id) {
                            let index = +this.$route.params.id - 1
                            this.$router.replace(`/bucket/${index}`)
                        }
                        
                    }).catch(e => {
                        this.$Notice.error({
                            title: '空间删除失败'
                        });
                    });
                },
                cancel: (_close) => {_close()}
            })
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
                    this.addForm.bucket = '';
                    this.addForm.region = 'default';
                    return this.getBuckets();
                }).catch(e => {
                    console.log(e)
                    this.$Notice.error({
                        title: `空间${bucket}创建失败`
                    });
                });
            });
        },
        refresh() {
            this.$Loading.config({
                color: '#19be6b',
                failedColor: '#f0ad4e',
                height: 5
            });
            this.$Loading.start();
            this.getBuckets().then(() => {
                this.$Loading.finish();
                this.$Notice.success({
                    title: '刷新成功'
                });
            }).catch(e => {
                this.$Loading.error()
            });
        }
    },
    components: {
        BucketDetail
    }
}
</script>
<style>
.layout {
    position: relative;
    height: 100%;
    overflow: hidden;
}
.layout .left-menu {
    width: 200px;
    height: 100%;
    background: #495060;
    float: left;
    position: relative;
}
.layout .right-content {
    width: calc(100% - 200px);
    height: 100%;
    float: left;
    padding: 25px;
}
.layout .setting-icon {
    position: absolute;
    color: rgba(255,255,255,.7);
    cursor: pointer;
    left: 20px;
    bottom: 20px;
    transition: color .3s ease-in-out;
}
.layout .setting-icon:hover {
    color: #fff;
}
.layout .add-icon {
    cursor: pointer;
    color: rgba(255,255,255,.7);
    transition: color .3s ease-in-out;
}
.layout .add-icon:hover {
    color: #fff;
}
.layout .bucket-item {
    display: inline-block;
    width: 160px;
    height: 180px;
    position: relative;
}
.layout .ivu-spin-fix {
    background: rgba(255, 255, 255, .8);
}

.layout .del-bucket-btn {
    float: right;
    margin-top: 2px;
    width: 20px;
    height: 20px;
    text-align: center;
    z-index: 99;
}
.spin-icon-load {
    animation: ani-spin 1s linear infinite;
}
@keyframes ani-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}
</style>