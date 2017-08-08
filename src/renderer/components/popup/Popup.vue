<template>
    <mu-popup position="top" :overlay="false" popupClass="popup-top" :open="topPopup">
        {{msg}}
    </mu-popup>
</template>
<script>
export default {
    data() {
        return {
            topPopup: false
        }
    },
    mounted() {
        this.topPopup = true;
        setTimeout(() => {
            this.topPopup = false;
            this.$nextTick(() => {
                this.$destroy();
            });
        }, 2000);
    },
    destroyed() {
        this.$el.remove();
    },
}
</script>
<style>
.popup-top {
    width: 100%;
    height: 48px;
    line-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 375px;
}
</style>