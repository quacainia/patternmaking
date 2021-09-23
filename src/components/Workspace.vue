<template>
  <div class="canvas-container">
    <canvas class="myCanvas" ref="canvas"></canvas>
  </div>
</template>

<script type="text/javascript">
import {drawBackDraft, drawFrontDraft, setupGuide} from '@/shared/moulage/bodice.js';
import {draw, resizeCanvas} from '@/shared/moulage/utilities.js';

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

  created() {
    window.addEventListener("resize", this.resizeCanvas);
  },

  methods: {
    resizeCanvas() {
      resizeCanvas(this.$refs.canvas);
      draw(this.$refs.canvas, this.bodiceGuide, this.backBodice, this.frontBodice);
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
    draw(this.$refs.canvas, bodiceGuide, backBodice, frontBodice);
    // console.log('draw', performance.now() - start);

    this.backBodice = backBodice;
    this.bodiceGuide = bodiceGuide;
    this.frontBodice = frontBodice;
  },

  unmounted() {
    window.removeEventListener("resize", this.resizeCanvas);
  },
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
