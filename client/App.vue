<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
export default {

};
</script>

<style lang="less">
    @import 'asset/style/global.less';

    html, body {
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
    }

    ul, li {
        margin: 0;
        padding: 0;
    }

    a {
        text-decoration: none;
    }

    #app {
        width: 100%;
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>
