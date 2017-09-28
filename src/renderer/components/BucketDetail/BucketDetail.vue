<template>
    <div class="bucket-detail" ref="bucketDetail">
        <div class="bar">
            <Select v-model="domain" style="width:250px">
                    <Option v-for="item in domains" :value="item" :key="item">{{ item }}</Option>
            </Select>
            <div class="fr">
                <input placeholder="输入前缀，回车搜索" class="search-input" ref="searchInput" v-model="searchStr" @blur="searchBlur" @keyup.enter="searchEnter" type="text" :style="{width: isSeaching ? '150px' : 0}">
                <Icon @click.native="handleSearch" type="search" :class="{active: isSeaching}"></Icon>
                <Icon @click.native="refresh" type="refresh" title="刷新"></Icon>
                <Icon @click.native="uploadModal = true" type="android-upload" title="上传"></Icon>
                <Icon @click.native="downloadChecked" type="android-download" title="批量下载"></Icon>
                <Icon @click.native="delectChecked" type="android-delete" title="批量删除"></Icon>
            </div>
        </div>
        <Table :columns="columns" :data="content" @on-selection-change="changeSelect"></Table>
        <!--<Page 
            v-if="sum > 0" 
            :total="sum" 
            :current.sync="pageNum" 
            :page-size="pageSize"
            @on-change="changePage">
        </Page>-->
        <Modal class-name="preview-modal" width="500" v-model="imgModal" style="text-align: center;">
            <h2 slot="header">{{currentImg.key}}</h2>
            <img :src="currentImg.src" style="max-width: 100%;">
            <div slot="footer">
                <p class="desc">文件大小：{{this.fileSize(currentImg.fsize)}}</p>
                <p class="desc">最后更新：{{this.formatDate(currentImg.putTime)}}</p>
                <p class="desc">外链地址：<a @click="copyLink(currentImg.url)">{{currentImg.url}}</a> 
                    <Button @click="download(currentImg)" style="font-size: 16px;padding: 0 15px;margin-left: 10px;" icon="ios-cloud-download-outline"></Button> 
                </p>
            </div>
        </Modal>
        <Modal 
            class-name="upload-modal"
            width="500"
            :closable="false"
            :mask-closable="false"
            v-model="uploadModal"
            style="text-align: center;">
            <div slot="header">
                <h2>上传文件</h2>
            </div>
            <Upload
                :before-upload="beforeUpload" 
                :on-success="uploadSuccess"
                :on-error="uploadError"
                :on-remove="removeFile"
                :data="uploadData" 
                :action="uploadURL"
                ref="upload"
                name="file" 
                multiple>
                <Button type="primary" icon="ios-cloud-upload-outline">请选择要上传的文件</Button>
                <div class="upload-tip" slot="tip"></div>
            </Upload>
            <div slot="footer">
                <Button @click="uploadModalClose">关 闭</Button>
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
import Policy from '../../common/policy';
import Loading from '@/assets/images/loading.svg';
import Qiniu from '../../common/qiniu';

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
                    width: 400,
                    key: 'key',
                    ellipsis: true
                },
                {
                    title: '文件类型',
                    width: 150,
                    key: 'mimeType',
                    filters: [
                        {
                            label: '仅图片',
                            value: 1
                        }
                    ],
                    filterMultiple: false,
                    filterMethod:  (value, row) => {
                        if (value === 1) {
                            return this._isImageMimeType(row.mimeType)
                        }
                    }
                },
                {
                    title: '文件大小',
                    width: 150,
                    key: 'fsize',
                    sortable: true,
                    sortMethod: (a, b, type) => {
                        a = this._getOriginalFileSize(a)
                        b = this._getOriginalFileSize(b)
                        return type === 'asc' ? a - b : b - a
                    }
                },
                {
                    title: '修改时间',
                    key: 'putTime',
                    sortable: true,
                    ellipsis: true
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
            pageSize: 100000, // 不分页了
            sum: 0,
            isSeaching: false,
            searchStr: ''
        }
    },
    props: ['name'],
    computed: {
        ...mapGetters([
            'downloadPath',
            'ak',
            'sk',
            'buckets'
        ]),
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
    watch: {
        name(newName) {
            if(newName) {
                this._getListByPage();
                this._getDomain();
            }
            
        }
    },
    beforeMount() {
        let bucketName = this.buckets[+this.$route.params.id]
        if (bucketName) {
            Qiniu.autoZone(this.ak, bucketName).then(response => {
                this.uploadURL = `http://${response.up.src.main[0]}`
            }).catch(error => {
                console.log(error)
            })
        }
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
    mounted() {
        this._getListByPage();
        this._getDomain();
        this.$nextTick(() => {
            let height = this.$refs.bucketDetail.clientHeight - 125 + 'px'
            document.querySelector('.ivu-table-body').style.maxHeight = height
        })
    },
    methods: {
        ...mapActions([
            'getList',
            'getListByPage',
            'getDomain',
            'deleteFile',
            'renameFile'
        ]),
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
                this.copyLink(this.getUrl(this.list[index].key))
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
        removeFile(file, fileList) {
            let item = {key: file.name}
            this._deleteOne(item)
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
        copyLink(text) {
            clipboard.writeText(text)
            this.$Notice.success({
                title: '链接复制成功'
            });
        },
        handleSearch() {
            this.isSeaching = true
            this.$nextTick(() => {
                this.$refs.searchInput.focus()
            })
        },
        searchBlur(e) {
            this.isSeaching = false
        },
        searchEnter() {
            if(/[\u4e00-\u9fa5]/.test(this.searchStr)) {
                this.$Notice.warning({
                    title: '不能搜索中文'
                });
                this.searchStr = ''
                return
            }
            this._getListByPage(this.searchStr)
        },
        _getListByPage(prefix) {
            this.getListByPage({
                bucket: this.name,
                pageSize: this.pageSize,
                pageNum: this.pageNum,
                prefix: prefix || ''
            }).then(list => {
                this.list = list.items;
                this.sum = list.sum;
            }).catch(e => {
                if(e.statusCode === 631) {
                    this.$router.replace('/bucket/0')
                }
            });
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
        _getExtName(filename) {
            let ext = /\.[^\.]+$/.exec(filename);
            if(!ext || !Array.isArray(ext) || ext.length === 0) return '';
            return ext[0];
        },
        _isImageMimeType(mime) {
            let imageMimeTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/svg+xml', 'image/x-icon']
            return imageMimeTypes.includes(mime)
        },
        _getOriginalFileSize(sizeStr) {
            let sizeArr = sizeStr.split(' ')
            let num = sizeArr[0]
            switch(sizeArr[1]) {
                case 'B':
                    return num
                case 'KB':
                    return num * 1024
                case 'MB':
                    return num * 1048576
            }
        }
    }
}
</script>
<style>
.bucket-detail {
    height: 100%;
}
.bucket-detail .bar {
    height: 30px;
    line-height: 30px;
    margin-bottom: 20px;
}
.bucket-detail .bar .fr {
    float: right;
}
.bucket-detail .bar .fr button {
    margin-left: 10px;
}
.bucket-detail .option .ivu-icon {
    font-size: 16px;
    padding: 5px 10px;
    cursor: pointer;
    color: #2d8cf0;
}
.bucket-detail .search-input {
    border: 0;
    outline: none;
    border-bottom: 2px solid #495060;
    position: relative;
    right: -18px;
    height: 24px;
    line-height: 20px;
    font-size: 14px;
    padding: 2px 0;
    color: #495060;
    transition: width .2s ease-in-out;
}
.bucket-detail .search-input:focus {
    border-bottom: 2px solid #2d8cf0;
}
.desc {
    text-align: left;
    font-size: 14px;
    padding: 5px 0;
    word-break: break-all;
}
.ivu-table-body {
    overflow-x: hidden;
    overflow-y: auto;
}
.ivu-table-cell {
    font-size: 14px;
}
.preview-modal .ivu-modal{
    top: 40px;
}
.upload-modal .ivu-upload {
    display: inline-block;
    margin-top: 5px;
}
.upload-modal .ivu-modal-body {
    height: 316px;
    padding: 0;
}
.upload-modal .ivu-modal-content {
    position: relative;
}
.upload-modal .ivu-upload-list {
    width: calc(100% - 20px);
    margin-left: 10px;
    overflow: auto;
    text-align: left;
}
.ivu-upload {
    width: 100%;
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
.bucket-detail .bar .fr .ivu-icon {
    width: 20px;
    height: 20px;
    text-align: center;
    margin-left: 15px;
    cursor: pointer;
    margin-top: 5px;
    font-size: 23px;
    transition: color .3s ease-in-out;
}
.bucket-detail .bar .fr .ivu-icon:hover {
    color: #2d8cf0;
}
.active {
    color: #2d8cf0;
}
</style>