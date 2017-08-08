<template>
    <div id="app">
        <mu-appbar title="Qiniu-client"></mu-appbar>
        <div class="home">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
export default {
 
}
</script>

<style>
html, body, #app {
    height: 100%;
}
.mu-appbar-title {
    text-align: center;
}
.home {
    width: 100%;
    height: calc(100% - 64px);
    overflow-x: hidden;
    overflow-y: auto;
}
</style>
