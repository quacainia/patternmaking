<template>
  <div class="home">
    <h1>Welcome</h1>
    <div>
      <button @click="zoom(false)">-</button>
      <button @click="zoom(true)">+</button>
    </div>
    <div>
      <table>
        <tr>
          <td></td>
          <td>
            <button @click="pan(0, 60)">^</button>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>
            <button @click="pan(-60, 0)">&lt;</button>
          </td>
          <td>
            <button @click="resetPan()">•</button>
          </td>
          <td>
            <button @click="pan(60, 0)">&gt;</button>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <button @click="pan(0, -60)">v</button>
          </td>
          <td></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'Home',

  computed: {
    ...mapGetters({
      getCanvas: 'canvas',
    }),
  },

  methods: {
    ...mapMutations({
      mutatePan: 'PAN',
      mutateZoom: 'ZOOM',
    }),
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
