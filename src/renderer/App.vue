<template>
    <div id="app">
        <div class="top-bar">QiNiu</div>
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
.top-bar {
    height: 64px;
    font-size: 20px;
    line-height: 64px;
    background: #2d8cf0;
    color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, .3);
    text-align: center;
}
.home {
    width: 100%;
    height: calc(100% - 64px);
    overflow-x: hidden;
    overflow-y: auto;
}
::-webkit-scrollbar {
    width: 7px;  
    height: 7px;  
    background-color: #F5F5F5;  
} 
::-webkit-scrollbar-track {
    background-color: #d9e2eb;  
}  
::-webkit-scrollbar-thumb {  
    border-radius: 10px;  
    box-shadow: inset 0 0 6px rgba(0,0,0,.3);  
    background-color: #99a9bf;  
}  
</style>
