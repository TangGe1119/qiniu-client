<template>
    <div class="bucket-detail">
        <div class="bar">
            <router-link to="/"><Button icon="ios-arrow-back" type="primary">返回首页</Button></router-link>
            <div class="fr">
                <Button @click="refresh" type="info" icon="refresh">刷新</Button>
                <Button type="success" icon="ios-cloud-upload-outline">上传</Button>
                <Button @click="downloadChecked" type="primary" icon="ios-cloud-download-outline">批量下载</Button>
                <Button type="warning" icon="android-delete">批量删除</Button>
            </div>
        </div>
        <Table :columns="columns" :data="content" @on-selection-change="changeSelect"></Table>
        <Modal class-name="preview-modal" width="500" v-model="imgModal" style="text-align: center;">
            <h2 slot="header">{{currentImg.key}}</h2>
            <img :src="currentImg.url" style="max-width: 100%;">
            <div slot="footer">
                <p class="desc">文件大小：{{this.fileSize(currentImg.fsize)}}</p>
                <p class="desc">最后更新：{{this.formatDate(currentImg.putTime)}}</p>
                <p class="desc">外链地址：<a>{{currentImg.url}}</a> 
                    <Button style="font-size: 16px;padding: 0 15px;margin-left: 10px;" icon="ios-cloud-download-outline"></Button> 
                </p>
            </div>
        </Modal>
    </div>
</template>
<script>
import {mapActions} from 'vuex';
import {Dropdown, Button, Icon, DropdownMenu, DropdownItem} from 'iview';
const {ipcRenderer} = require('electron');
export default {
    data() {
        return {
            list: [],
            domains: [],
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
                                <Dropdown trigger="click" title="更多操作">
                                    <Icon type="more"></Icon>
                                    <Dropdown-menu slot="list">
                                        <Dropdown-item>下载文件</Dropdown-item>
                                        <Dropdown-item>复制链接</Dropdown-item>
                                        <Dropdown-item>删除文件</Dropdown-item>
                                    </Dropdown-menu>
                                </Dropdown>
                            </div>
                        )
                    }
                }
            ],
            imgModal: false,
            currentImg: {},
            selection: []
        }
    },
    computed: {
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
        domain() {
            return this.domains[0]
        }
    },
    created() {
        this.getList({
            bucket: this.name
        }).then(list => {
            this.list = list.items;
        }).catch(e => {console.log(e)});

        this.getDomain(this.name).then(domains => {
            this.domains = domains;
        }).catch(e => {
            this.$Notice.error({
                title: '获取空间域名失败'
            });
        })
    },
    methods: {
        ...mapActions([
            'getList',
            'getDomain'
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

            if(!this.isImage(url)) {
                return this.$Notice.warning({
                    title: '该文件类型不支持预览'
                });
            }
            this.imgModal = true;
            this.currentImg = {
                ...current,
                url
            };
        },
        isImage(url) {
            let reg = /\.(jpe?g|gif|png|svg|ico)$/i;
            return reg.test(url);
        },
        refresh() {
            this.$Loading.config({
                color: '#47cb89',
                failedColor: '#f0ad4e',
                height: 5
            });
            this.$Loading.start();
            this.getList({
                bucket: this.name
            }).then(list => {
                this.list = list.items;
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
        downloadChecked() {
            if(this.selection.length === 0) {
                return this.$Notice.warning({
                    title: '最少选择一项下载'
                });
            }
            
        }
    }
}
</script>
<style>
.bucket-detail {

}
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
</style>