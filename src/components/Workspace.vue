<template>
  <div class="canvas-container">
    <canvas class="myCanvas" ref="canvas"></canvas>
  </div>
</template>

<script type="text/javascript">
import { mapGetters, mapMutations } from 'vuex';

import {drawBackDraft, drawFrontDraft, setupGuide} from '@/shared/moulage/bodice.js';
import {draw} from '@/shared/moulage/utilities.js';

export default {
  name: 'Workspace',

  data: function() {
    return {
      backBodice: {
        points: {},
        curves: {},
      },

      bodiceGuide: {
        curves: {},
      },

      frontBodice: {
        points: {},
        curves: {},
        labelColor: "#900",
        labelDefaultDir: "E",
      },
    }
  },

  computed: {
    ...mapGetters({
      getCanvas: 'canvas'
    }),
  },

  created() {
    window.addEventListener("resize", this.resizeCanvas);
  },

  methods: {
    ...mapMutations({
      mutateCanvasSize: 'CANVAS_SIZE',
    }),
    resizeCanvas() {
      let width = window.innerWidth * 2;
      let height = window.innerHeight * 2;

      this.$refs.canvas.width = width;
      this.$refs.canvas.height = height;
      this.mutateCanvasSize({width, height});
      draw(this.$refs.canvas, this.getCanvas, this.bodiceGuide, this.backBodice, this.frontBodice);
    }
  },

  mounted() {
    // let start = performance.now();
    this.resizeCanvas();

    let backBodice = {
      points: {},
      curves: {},
    };
    let bodiceGuide = {
      curves: {},
    };
    let frontBodice = {
      points: {},
      curves: {},
      labelColor: "#900",
      labelDefaultDir: "E",
    };


    setupGuide(bodiceGuide);
    drawBackDraft(backBodice, frontBodice, bodiceGuide);
    // console.log(performance.now() - start);
    drawFrontDraft(backBodice, frontBodice, false);
    // console.log('front', performance.now() - start);
    draw(this.$refs.canvas, this.getCanvas, bodiceGuide, backBodice, frontBodice);
    // console.log('draw', performance.now() - start);

    this.backBodice = backBodice;
    this.bodiceGuide = bodiceGuide;
    this.frontBodice = frontBodice;
  },

  unmounted() {
    window.removeEventListener("resize", this.resizeCanvas);
  },

  watch: {
    getCanvas() {
      draw(this.$refs.canvas, this.getCanvas, this.bodiceGuide, this.backBodice, this.frontBodice);
    }
  }
}
</script>

<style lang="scss">
.myCanvas {
  background-color: #FFF;
  width: 100%;
  height: 100%;
}
.canvas-container {
  width: 100%;
  height: 100%;
  z-index: 0;
  position: absolute;
  top: 0px;
  left: 0px;
  overflow: hidden;
}
</style>
