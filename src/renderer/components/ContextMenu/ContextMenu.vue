<template>
    <div :style="style" class="contextmenu">
        <ul>
            <li @click="remove">删除空间</li>
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
    },
    computed: {
        style() {
            return {
                position: 'absolute',
                left: this.left - 25 + 'px',
                top: this.top - 90 + 'px'
            }
        }
    },
    methods: {
        remove() {
            this.$emit('remove');
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
    color: #333;
}
.contextmenu ul li:hover {
    background: #efefef;
    color: #2d8cf0;
}
</style>
