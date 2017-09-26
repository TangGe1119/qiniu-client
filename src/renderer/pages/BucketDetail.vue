<template>
    <div class="bucket-detail">
        <div class="bar">
            <router-link to="/"><Button icon="ios-arrow-back" type="primary">返回首页</Button></router-link>
            <div class="fr">
                <Select v-model="domain" style="width:250px">
                    <Option v-for="item in domains" :value="item" :key="item">{{ item }}</Option>
                </Select>
                <Button @click="refresh" type="info" icon="refresh">刷新</Button>
                <Button @click="uploadModal = true" type="success" icon="ios-cloud-upload-outline">上传</Button>
                <Button @click="downloadChecked" type="primary" icon="ios-cloud-download-outline">批量下载</Button>
                <Button @click="delectChecked" type="warning" icon="android-delete">批量删除</Button>
            </div>
        </div>
        <Table :columns="columns" :data="content" @on-selection-change="changeSelect"></Table>
        <Page 
            v-if="sum > 0" 
            :total="sum" 
            :current.sync="pageNum" 
            :page-size="pageSize"
            @on-change="changePage">
        </Page>
        <Modal class-name="preview-modal" width="500" v-model="imgModal" style="text-align: center;">
            <h2 slot="header">{{currentImg.key}}</h2>
            <img :src="currentImg.src" style="max-width: 100%;">
            <div slot="footer">
                <p class="desc">文件大小：{{this.fileSize(currentImg.fsize)}}</p>
                <p class="desc">最后更新：{{this.formatDate(currentImg.putTime)}}</p>
                <p class="desc">外链地址：<a>{{currentImg.url}}</a> 
                    <Button @click="download(currentImg)" style="font-size: 16px;padding: 0 15px;margin-left: 10px;" icon="ios-cloud-download-outline"></Button> 
                </p>
            </div>
        </Modal>
        <Modal class-name="upload-modal" width="500" v-model="uploadModal" style="text-align: center;">
            <div slot="header">
                <h2>上传文件</h2>
            </div>
            <p class="tip-text" v-if="!hasUpload">请选择要上传的文件</p>
            <div slot="footer">
                <Upload 
                    :before-upload="beforeUpload" 
                    :on-success="uploadSuccess"
                    :on-error="uploadError"
                    :data="uploadData" 
                    ref="upload"
                    name="file" 
                    multiple 
                    :action="uploadURL">
                    <Button type="primary" icon="ios-cloud-upload-outline">选择文件</Button>
                    <div class="upload-tip" slot="tip"></div>
                </Upload>
                <Button @click="uploadModalClose">关闭</Button>
            </div>
        </Modal>
        <Modal class-name="rename-modal" width="500" v-model="renameModal" style="text-align: center;">
            <h3 slot="header">文件重命名</h3>
            <div>
                <Form ref="renameForm" :model="renameForm" :label-width="100" :rules="renameRule">
                    <Form-item label="新的文件名" prop="newFilename">
                        <Input v-model="renameForm.newFilename">
                            <span slot="append">{{extname}}</span>
                        </Input>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer">
                <Button @click="confirmRename" type="primary">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import {mapActions, mapGetters} from 'vuex';
import {Dropdown, Button, Icon, DropdownMenu, DropdownItem} from 'iview';
import {ipcRenderer, clipboard} from 'electron';
// import copyTextToClipboard from '../common/copy';
import Policy from '../common/policy';
import Loading from '@/assets/images/loading.svg';
import Qiniu from '../common/qiniu';

export default {
    data() {
        return {
            list: [],
            domains: [],
            domain: '',
            columns: [
                {
                    type: 'selection',
                    width: 60,
                    align: 'center'
                },
                {
                    title: '文件名',
                    width: 500,
                    key: 'key'
                },
                {
                    title: '文件类型',
                    key: 'mimeType'
                },
                {
                    title: '文件大小',
                    key: 'fsize'
                },
                {
                    title: '修改时间',
                    key: 'putTime'
                },
                {
                    title: '操作',
                    key: 'action',
                    align: 'center',
                    render: (h, params) => {
                        return (
                            <div class="option">
                                <span onClick={this.preview.bind(this, params.index)}>
                                    <Icon type="eye" title="预览"></Icon>
                                </span>
                                <Dropdown trigger="click" onOn-click={this.dropdown.bind(this, params.index)} title="更多操作">
                                    <Icon type="more"></Icon>
                                    <Dropdown-menu slot="list">
                                        <Dropdown-item name="rename">重命名</Dropdown-item>
                                        <Dropdown-item name="download">下载文件</Dropdown-item>
                                        <Dropdown-item name="delete">删除文件</Dropdown-item>
                                        <Dropdown-item name="copy">复制链接</Dropdown-item>
                                    </Dropdown-menu>
                                </Dropdown>
                            </div>
                        )
                    }
                }
            ],
            imgModal: false,
            currentImg: {},
            selection: [],
            uploadModal: false,
            uploadURL: '',
            uploadData: {},
            hasUpload: false,
            renameModal: false,
            currentFilename: '',
            renameForm: {
                newFilename: ''
            },
            renameRule: {
                newFilename: [
                    { required: true, message: '文件名不能为空', trigger: 'blur' }
                ],
            },
            pageNum: 1,
            pageSize: 10,
            sum: 0
        }
    },
    computed: {
        ...mapGetters([
            'downloadPath',
            'ak',
            'sk'
        ]),
        name() {
            return this.$route.params.name;
        },
        content() {
            return this.list.map(item => {
                return {
                    ...item,
                    fsize: this.fileSize(item.fsize),
                    putTime: this.formatDate(item.putTime)
                }
            })
        },
        extname() {
            return this._getExtName(this.currentFilename);
        }
    },
    created() {
        this._getListByPage();
        this._getDomain();
        
        ipcRenderer.on('download-success', (event, filename) => {
            this.$Notice.success({
                title: '下载成功',
                desc: `${filename}下载成功`
            });
        });
        ipcRenderer.on('clipboard-success', (event) => {
            this.$Notice.success({
                title: '链接复制成功'
            });
        });
    },
    beforeMount() {
        let bucketName = this.$route.params.name
        if (bucketName) {
            Qiniu.autoZone(this.ak, bucketName).then(response => {
                this.uploadURL = `http://${response.up.src.main[0]}`
            }).catch(error => {
                console.log(error)
            })
        }
    },
    methods: {
        ...mapActions([
            'getList',
            'getListByPage',
            'getDomain',
            'deleteFile',
            'renameFile'
        ]),
        _getListByPage() {
            this.getListByPage({
                bucket: this.name,
                pageSize: this.pageSize,
                pageNum: this.pageNum
            }).then(list => {
                this.list = list.items;
                this.sum = list.sum;
            }).catch(e => {console.log(e)});
        },
        _getDomain() {
            this.getDomain(this.name).then(domains => {
                this.domains = domains;
                this.domain = domains[0];
            }).catch(e => {
                this.$Notice.error({
                    title: '获取空间域名失败'
                });
            });
        },
        fileSize(size) {
            if(size > 1048576) {
                size = (size / 1048576).toFixed(2) + ' MB';
            }else if(size > 1024) {
                size = (size / 1024).toFixed(2) + ' KB';
            }else {
                size = size + ' B'
            }
            return size;
        },
        formatDate(timestamp) {
            const date = new Date(timestamp / 10000);
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hh = date.getHours();  
            let mm = date.getMinutes();
            let ss = date.getSeconds();
            let localString = year + "-";
            if (month < 10) localString += "0";
            localString += month + "-";
            if (day < 10) localString += "0";
            localString += day + " ";
            if (hh < 10) localString += "0";
            localString += hh + ":";
            if (mm < 10) localString += '0';
            localString += mm + ':';
            if (ss < 10) localString += '0';
            localString += ss;
            return localString;
        },
        preview(index) {
            let current = this.list[index];
            let url = `http://${this.domain}/${current.key}`;
            this.currentImg = {
                ...current,
                src: Loading,
                url
            };
            if(!this.isImage(url)) {
                return this.$Notice.warning({
                    title: '该文件类型不支持预览'
                });
            }
            this.imgModal = true;

            const img = new Image();
            img.src = url;
            img.onload = () => {
                this.currentImg.src = url;
            };   
        },
        isImage(url) {
            let reg = /\.(jpe?g|gif|png|svg|ico)$/i;
            return reg.test(url);
        },
        getUrl(key) {
            return `http://${this.domain}/${key}`;
        },
        refresh() {
            this.$Loading.config({
                color: '#19be6b',
                failedColor: '#f0ad4e',
                height: 5
            });
            this.$Loading.start();
            this.getListByPage({
                bucket: this.name,
                pageSize: this.pageSize,
                pageNum: this.pageNum
            }).then(list => {
                this.list = list.items;
                this.sum = list.sum;
                this.$Loading.finish();
                this.$Notice.success({
                    title: '刷新成功'
                });
            }).catch(e => {
                this.$Loading.error()
            });
        },
        changeSelect(selection) {
            this.selection = selection;
        },
        dropdown(index, name) {
            if(name === 'download') {
                this.download(this.list[index]);
            }else if(name === 'delete') {
                this.delete(this.list[index]);
            }else if(name === 'copy') {
                clipboard.writeText(this.getUrl(this.list[index].key))
                this.$Notice.success({
                    title: '链接复制成功'
                });
            }else if(name === 'rename') {
                this.renameModal = true;
                this.newFilename = '';
                this.currentFilename = this.list[index].key;
            }
        },
        downloadChecked() {
            if(this.selection.length === 0) {
                return this.$Notice.warning({
                    title: '最少选择一项下载'
                });
            }
            this.selection.forEach(item => {
                this.download(item);
            });
            this._getListByPage();
        },
        download(currentImg) {
            ipcRenderer.send('download', {
                url: this.getUrl(currentImg.key), 
                downloadPath: this.downloadPath, 
                filename: currentImg.key
            });
        },
        _deleteOne(item) {
            return new Promise((resolve, reject) => {
                this.deleteFile({bucket: this.name, key: item.key}).then(() => {
                    this.$Notice.success({
                        title: `${item.key}删除成功`
                    });
                    resolve();
                }).catch(e => {reject()});
            })
        },
        delectChecked() {
            if(this.selection.length === 0) {
                return this.$Notice.warning({
                    title: '最少选择一项删除'
                });
            }
            let promiseArr = [];
            this.selection.forEach(item => {
                promiseArr.push(this._deleteOne(item));
            });
            Promise.all(promiseArr).then(() => {
                this._getListByPage();
            });
        },
        delete(item) {
            this._deleteOne(item).then(() => {
                this._getListByPage();
            });
        },
        uploadModalClose() {
            this.uploadModal = false;
            this.$refs.upload.clearFiles();
            this.refresh();
        },
        beforeUpload(file) {
            this.hasUpload = true;
            const options = {
                scope: `${this.name}:${file.name}`,
            };
            const mac = {
                accessKey: this.ak,
                secretKey: this.sk,
            };
            const putPolicy = new Policy(options);
            const uploadToken = putPolicy.uploadToken(mac);
            this.$set(this.uploadData, 'key', file.name);
            this.$set(this.uploadData, 'token', uploadToken);
        },
        uploadSuccess(response, file, fileList) {
            this.$Notice.success({
                title: `${file.name}上传成功`
            });
        },
        uploadError(error, file, fileList) {
            this.$Notice.error({
                title: `${file.name}上传失败`
            });
        },
        changePage(page) {
            this.pageNum = page;
            this._getListByPage();
        },
        confirmRename() {
            this.$refs['renameForm'].validate((valid) => {
                if (!valid) {
                    return false;
                }
                let src = this.currentFilename;
                let ext = this._getExtName(src);
                let dest = this.renameForm.newFilename + ext;
                this.renameFile({
                    bucket: this.name,
                    src,
                    dest
                }).then(() => {
                    this.$Notice.success({
                        title: '修改成功'
                    });
                    this.renameForm.newFilename = '';
                    this.renameModal = false;
                    this._getListByPage();
                }).catch(e => {
                    if(e.statusCode === 614) {
                        this.$Notice.error({
                            title: `该文件名已存在`
                        });
                        this.renameForm.newFilename = '';
                    }
                });
            })
            
        },
        _getExtName(filename) {
            let ext = /\.[^\.]+$/.exec(filename);
            if(!ext || !Array.isArray(ext) || ext.length === 0) return '';
            return ext[0];
        }
    }
}
</script>
<style>
.bucket-detail  .bar {
    height: 30px;
    line-height: 30px;
    margin-bottom: 20px;
}
.bucket-detail  .bar .fr {
    float: right;
}
.bucket-detail  .bar .fr button {
    margin-left: 10px;
}
.bucket-detail .option .ivu-icon {
    font-size: 16px;
    padding: 5px 10px;
    cursor: pointer;
    color: #2d8cf0;
}
.desc {
    text-align: left;
    font-size: 14px;
    padding: 5px 0;
    word-break: break-all;
}
.ivu-table-cell {
    font-size: 14px;
}
.preview-modal .ivu-modal{
    top: 40px;
}
.upload-modal .ivu-upload {
    display: inline-block;
    margin-right: 5px;
}
.upload-modal .ivu-modal-body {
    height: 316px;
    padding: 0;
}
.upload-modal .ivu-modal-content {
    position: relative;
}
.upload-modal .ivu-upload-list {
    position: absolute;
    top: 50px;
    left: 20px;
    width: calc(100% - 20px);
    height: 300px;
    overflow: auto;
    text-align: left;
}
.upload-modal .ivu-upload-list-remove {
    display: none;
}
.upload-modal .tip-text {
    text-align: center;
    padding: 10px;
    font-size: 14px;
}
.ivu-upload-list-file {
    font-size: 14px;
    padding: 6px;
}
.bucket-detail .ivu-page {
    padding-top: 20px;
    text-align: center;
}
</style>