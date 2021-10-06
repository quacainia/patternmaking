import { createStore } from 'vuex';

import draftModule from '@/store/modules/draft.js';

export default createStore({
  state: {
    canvas: {
      dimensions: {
        width: 0,
        height: 0,
      },
      pan: {
        xPadding: 840,
        x: 0,
        y: 0,
      },
      zoom: 1,
      zoomFit: true,
    }
  },
  mutations: {
    CANVAS_SIZE(state, {width, height}) {
      if (width && height) {
        state.canvas = Object.assign({}, state.canvas, {dimensions: {width, height}});
      }
    },
    PAN(state, {x, y, reset}) {
      let oldPan = state.canvas.pan;
      let stateZoom = state.canvas.zoom;
      let newX, newY;
      if (reset) {
        newX = newY = 0;
      } else {
        newX = oldPan.x + x/stateZoom;
        newY = oldPan.y - y/stateZoom;
      }
      state.canvas = Object.assign({}, state.canvas, {pan: Object.assign({}, oldPan, {x: newX, y: newY}), zoomFit: false});
    },
    FIT_ZOOM(state, {width, height, canvas}) {
      let canvasWidth, canvasHeight;

      if (canvas) {
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
      } else {
        canvasWidth = state.canvas.dimensions.width;
        canvasHeight = state.canvas.dimensions.height;
      }

      let xRatio = (canvasWidth - state.canvas.pan.xPadding) / width;
      let yRatio = canvasHeight / height;
      let pan, zoomLevel;
      if (xRatio > yRatio) {
        zoomLevel = yRatio;
        pan = {x: ((canvasWidth - state.canvas.pan.xPadding) - width * zoomLevel) / 2, y: 0}
      } else {
        zoomLevel = xRatio;
        pan = {y: (canvasHeight - height * zoomLevel) / 2, x: 0}
      }
      // console.log(Object.assign({}, state.canvas.pan, pan));
      state.canvas = Object.assign({}, state.canvas, {zoom: zoomLevel, pan: Object.assign({}, state.canvas.pan, pan), zoomFit: true});
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

      state.canvas = Object.assign({}, state.canvas, {zoom: newZoomLevel, pan: Object.assign({}, oldPan, {x: panX, y: panY}), zoomFit: false});
    },
  },
  actions: {
  },
  modules: {
    draft: draftModule,
  },
  getters: {
    canvas(state) {
      return state.canvas;
    }
  }
})
