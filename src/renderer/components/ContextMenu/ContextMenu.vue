<template>
    <div :style="style" class="contextmenu">
        <ul>
            <li v-if="!isBucket" @click.stop="refresh">刷新</li>
            <li v-if="!isBucket" @click.stop="add">新建空间</li>
            <li v-if="!isBucket" @click.stop="setting">基础设置</li>
            <li v-if="isBucket"  @click.stop="remove">删除空间</li>
        </ul>
    </div>
</template>
<script>
export default {
    props: {
        left: {
            type: Number,
            required: true
        },
        top: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            default: ''
        }
    },
    computed: {
        style() {
            return {
                position: 'absolute',
                left: this.left - 25 + 'px',
                top: this.top - 90 + 'px'
            }
        },
        isBucket() {
            return this.type === 'bucket';
        }
    },
    methods: {
        remove() {
            this.$emit('remove');
        },
        refresh() {
            this.$emit('refresh');
        },
        add() {
            this.$emit('add');
        },
        setting() {
            this.$emit('setting');
        }
    }
}
</script>
<style>
.contextmenu {
    width: 100px;
    background: #fefefe;
    box-shadow: 0 0 5px #ccc;
    border-radius: 4px;
    cursor: pointer;
    padding: 5px 0;
}
.contextmenu ul li {
    padding: 6px 20px; 
    font-size: 14px;
    color: #555;
}
.contextmenu ul li:hover {
    background: #efefef;
    color: #2d8cf0;
}
</style>
