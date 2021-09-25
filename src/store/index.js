import { createStore } from 'vuex'

export default createStore({
  state: {
    canvas: {
      dimensions: {
        width: 0,
        height: 0,
      },
      pan: {
        x: 0,
        y: 0,
      },
      zoom: 1,
    }
  },
  mutations: {
    CANVAS_SIZE(state, {width, height}) {
      if (width && height) {
        state.canvas = Object.assign({}, state.canvas, {dimensions: {width, height}});
      }
    },
    PAN(state, {x, y, reset}) {
      let statePan = state.canvas.pan;
      let stateZoom = state.canvas.zoom;
      let newX, newY;
      if (reset) {
        newX = newY = 0;
      } else {
        newX = statePan.x + x/stateZoom;
        newY = statePan.y - y/stateZoom;
      }
      state.canvas = Object.assign({}, state.canvas, {pan: {x: newX, y: newY}});
    },
    ZOOM(state, shouldZoomIn) {
      let zoomLevel = state.canvas.zoom;
      let oldPan = state.canvas.pan;
      let newZoomLevel;

      let {width, height} = state.canvas.dimensions;
      let oldZoomWidth = width / zoomLevel;
      let oldZoomHeight = height / zoomLevel;

      if (shouldZoomIn) {
        newZoomLevel = zoomLevel * 1.1;
      } else {
        newZoomLevel = zoomLevel / 1.1;
      }

      let newZoomWidth = width / newZoomLevel;
      let newZoomHeight = height / newZoomLevel;
      let centerX = oldZoomWidth/2 - oldPan.x;
      let centerY = oldZoomHeight/2 - oldPan.y;

      let panX = newZoomWidth/2 - centerX;
      let panY = newZoomHeight/2 - centerY;

      state.canvas = Object.assign({}, state.canvas, {zoom: newZoomLevel, pan: {x: panX, y: panY}});
    },
  },
  actions: {
  },
  modules: {
  },
  getters: {
    canvas(state) {
      return state.canvas;
    }
  }
})
