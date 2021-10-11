<template>
  <div class="canvas-container">
    <canvas
      class="myCanvas"
      ref="canvas"
      @wheel="scroll"
    />
  </div>
</template>

<script type="text/javascript">
import { mapGetters, mapMutations } from 'vuex';

import {GRID_SIZE, WORKSPACE_HEIGHT, WORKSPACE_WIDTH} from '@/shared/moulage/constants.js';
import {draw} from '@/shared/moulage/utilities.js';

export default {
  name: 'Workspace',

  data: function() {
    return {
      isMouseDown: false,
      startDrag: {},
    }
  },

  computed: {
    ...mapGetters({
      getCanvas: 'canvas',
      getCanvasDimensions: 'canvasDimensions',
    }),
    ...mapGetters('draft', {
      getDisplayPattern: 'displayPattern',
    }),
    displayPieces() {
      return this.getDisplayPattern && this.getDisplayPattern.displayPieces;
    },
  },

  created() {
    window.addEventListener("resize", this.resizeCanvas);
  },

  methods: {
    ...mapMutations({
      mutateCanvasSize: "CANVAS_SIZE",
      mutateFitZoom: "FIT_ZOOM",
      mutateZoom: 'ZOOM',
    }),
    redraw(shouldRefit = true) {
      draw(this.$refs.canvas, this.getCanvas, this.getDisplayPattern);
      if (shouldRefit && this.getCanvas.zoomFit) {
        this.mutateFitZoom({
          width: WORKSPACE_WIDTH * GRID_SIZE,
          height: WORKSPACE_HEIGHT * GRID_SIZE, // TODO: These are hardcoded
        });
      }
    },
    resizeCanvas() {
      let width = window.innerWidth * 2;
      let height = window.innerHeight * 2;

      this.$refs.canvas.width = width;
      this.$refs.canvas.height = height;
      this.mutateCanvasSize({width, height});
    },
    scroll: function(){
      let startTime;
      return function (event) {
        if (!startTime || performance.now() - startTime > 100) {
          startTime = performance.now();
          let deltaY = Math.min(Math.max(event.deltaY, -20), 20)
          this.mutateZoom(1.02 ** deltaY);
        }
        event.preventDefault()
      }
    }(), // TODO: this can't be the right way to handle scoping startTime
  },

  mounted() {
    this.resizeCanvas();
  },

  unmounted() {
    window.removeEventListener("resize", this.resizeCanvas);
  },

  watch: {
    getCanvasDimensions() {
      this.redraw();
    },
    getCanvas() {
      this.redraw(false);
    },
    displayPieces() {
      this.redraw();
    },
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
