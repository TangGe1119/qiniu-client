<template>
    <div class="bucket" @click="handleClick">
        <img src="../../assets/images/folder.svg" alt="">
        <p class="name">{{name}}</p>
    </div>
</template>
<script>
export default {
    props: {
        name: {
            type: String,
            required: true
        }
    },
    methods: {
        handleClick() {
            this.$emit('click', this.name);
        }
    }
}
</script>
<style>
.bucket {
    padding: 30px;
    cursor: pointer;
}
.bucket img {
    width: 100%;
}
.bucket .name {
    margin: 10px;
    text-align: center;
    font-size: 16px;
}
.bucket:hover .name {
    color: #2196f3;
}
.bucket:hover img {
    transform: scale(1.1);
    transition: transform .2s ease-in-out;
}
</style>