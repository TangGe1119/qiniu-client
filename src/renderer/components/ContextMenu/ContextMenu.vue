<template>
    <div :style="style" class="contextmenu">
        <h3>contextmenu</h3>
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
    }
}
</script>
<style>
.contextmenu {
    width: 200px;
    padding: 10px 0;
    background: #fefefe;
    box-shadow: 0 0 5px #ccc;
    border-radius: 4px;
    cursor: pointer;
}
</style>
