<template>
  <div @mouseup="mouseup" @mousemove="mousemove">
    <Workspace @mousedown="mousedown" @mouseout.stop="" />
    <Tile @mouseout.stop="">
      <Title />

      <p class="warning">
        <strong>Heads up!</strong> This page is currently feature incomplete and in demo mode only. <router-link to="/demo">More info.</router-link>
      </p>

      <router-view/>
    </Tile>
    <Dots />
    <Notice />
  </div>
</template>

<script type="text/javascript">
import _throttle from 'lodash/throttle';
import { mapGetters, mapMutations } from 'vuex';

// @ is an alias to /src
import Dots from '@/components/Dots.vue';
import Notice from '@/components/Notice.vue';
import Tile from '@/components/Tile.vue';
import Title from '@/components/Title.vue';
import Workspace from '@/components/Workspace.vue';

export default {
  name: 'Home',
  data: function() {
    return {
      isMouseDown: false,
      startDrag: {},
    }
  },
  components: {
    Dots,
    Notice,
    Tile,
    Title,
    Workspace,
  },
  computed: {
    ...mapGetters({
      getCanvas: 'canvas',
    })
  },

  created() {
    window.addEventListener("mouseout", this.mouseout);
  },

  methods: {
    ...mapMutations({
      mutatePan: 'MOUSE_PAN',
    }),
    mousedown(event) {
      this.isMouseDown = true;
      this.startDrag.x = event.clientX;
      this.startDrag.y = event.clientY;
      this.startDrag.canvas = this.getCanvas;
      event.preventDefault();
      return false;
    },
    mousemove(event) {
      if (this.isMouseDown) {
        this.mutatePanThrottle({x: event.clientX, y: event.clientY});
      }
    },
    mouseout() {
      this.isMouseDown = false;
    },
    mouseup() {
      this.isMouseDown = false;
    },
    mutatePanThrottle: _throttle(
      function(end) {
        this.mutatePan({start: this.startDrag, end});
      }, 100
    ),
  },

  unmounted() {
    window.removeEventListener("mouseout", this.mouseout);
  },
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
a {
  color: #27F;
  text-decoration: none;
  cursor: pointer;
}
p.warning {
  color:red;
}
h4.title{
  margin: 0px;
}
h3.title{
  margin: 0px;
}
h1.title {
  margin: 0px;
}
</style>
