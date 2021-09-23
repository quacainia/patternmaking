<template>
  <Workspace></Workspace>
  <div class="info-box">
    <router-view/>
  </div>
</template>

<script type="text/javascript">
// @ is an alias to /src
import Workspace from '@/components/Workspace.vue'

export default {
  name: 'Home',
  components: {
    Workspace
  }
}
</script>

<style lang="scss">
div {
  box-sizing: border-box;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
@font-face {
  font-family: Fenix;
  src: url('/fonts/fenix/Fenix-Regular.ttf');
}
body {
  margin: 0px 0px;
  padding: 0px 0px;
  background-color: #FFF;
  font-family: Fenix, serif;
}
.info-box {
  z-index: 100;
  position: absolute;
  top: 10px;
  left: 300px;
  width: 300px;
  background-color: #FFF;
  border: 1px #27F solid;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.5);
  padding: 5px;
  overflow: auto;
}
</style>