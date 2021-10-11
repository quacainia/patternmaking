<template>
  <div class="title-bar">
    <div>
      <h1 class="title">
        <router-link to="/">
          Moulage
        </router-link>
      </h1>
    </div>
    <div class="zoom">
      <button @click="zoom(1/1.1)">-</button>
      <button @click="zoom(1.1)">+</button>
      <br />
      <button @click="fitZoom">Fit</button>
    </div>
    <div>
      <table>
        <tr>
          <td></td>
          <td>
            <button @click="pan(0, -60)">^</button>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>
            <button @click="pan(60, 0)">&lt;</button>
          </td>
          <td>
            <button @click="resetPan()">•</button>
          </td>
          <td>
            <button @click="pan(-60, 0)">&gt;</button>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <button @click="pan(0, 60)">v</button>
          </td>
          <td></td>
        </tr>
      </table>
    </div>
  </div>
</template>


<script>
import { mapMutations } from 'vuex';
import {GRID_SIZE, WORKSPACE_HEIGHT, WORKSPACE_WIDTH} from '@/shared/moulage/constants.js';

export default {
  name: 'Title',

  components: {
  },

  computed: {
  },

  methods: {
    ...mapMutations({
      mutateFitZoom: 'FIT_ZOOM',
      mutatePan: 'PAN',
      mutateZoom: 'ZOOM',
    }),
    fitZoom() {
      this.mutateFitZoom({
        width: WORKSPACE_WIDTH * GRID_SIZE,
        height: WORKSPACE_HEIGHT * GRID_SIZE,
      });
    },
    pan(x, y) {
      this.mutatePan({x, y});
    },
    resetPan() {
      this.mutatePan({reset: true});
    },
    zoom(shouldZoomIn) {
      
      this.mutateZoom(shouldZoomIn);
    },
  }
}


</script>

<style lang="scss">
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.zoom {
  text-align: center;
}
h1 > a {
  color: inherit;
  text-decoration: inherit;
}
</style>