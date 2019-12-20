<template>
    <div id="app">
        <router-view />
    </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  background-color: #f9f9f9 !important;
}

ul, li {
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/*--cover--*/
.ivu-btn-text:focus{
  box-shadow: none;
}

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
  background: transparent;
  border-radius: 4px
}

::-webkit-scrollbar-button {
  display: none
}

::-webkit-scrollbar-track {
  background-color: transparent
}

::-webkit-scrollbar-track-piece {
  background: transparent
}

::-webkit-scrollbar-thumb {
  width: 8px;
  min-height: 15px;
  background: #c1c1c1;
  border-radius: 4px
}

::-webkit-scrollbar-thumb:active, ::-webkit-scrollbar-thumb:hover {
  background: #7d7d7d
}
</style>
