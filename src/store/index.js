import { createStore } from 'vuex';

import draftModule from '@/store/modules/draft.js';
import { GRID_SIZE } from '@/shared/moulage/constants.js';

export default createStore({
  state: {
    canvas: {
      dimensions: {
        width: 0,
        height: 0,
      },
      pan: {
        leftPadding: 840,
        bottomPadding: 80,
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
    MOUSE_PAN(state, {start, end}) {
      let oldPan = state.canvas.pan;
      let newPanX = start.canvas.pan.x + (end.x - start.x)*2;
      let newPanY = start.canvas.pan.y + (end.y - start.y)*2;
      state.canvas = Object.assign({}, state.canvas, {pan: Object.assign({}, oldPan, {x: newPanX, y: newPanY}), zoomFit: false});
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

      let xRatio = (canvasWidth - state.canvas.pan.leftPadding) / width;
      let yRatio = (canvasHeight - state.canvas.pan.bottomPadding) / height;
      let pan, zoomLevel;
      if (xRatio > yRatio) {
        zoomLevel = yRatio;
        pan = {x: ((canvasWidth - state.canvas.pan.leftPadding) - width * zoomLevel) / 2, y: 0}
      } else {
        zoomLevel = xRatio;
        pan = {y: ((canvasHeight - state.canvas.pan.bottomPadding) - height * zoomLevel) / 2, x: 0}
      }
      // console.log(Object.assign({}, state.canvas.pan, pan));
      state.canvas = Object.assign({}, state.canvas, {zoom: zoomLevel, pan: Object.assign({}, state.canvas.pan, pan), zoomFit: true});
    },
    ZOOM(state, shouldZoomIn) {
      let oldZoomLevel = state.canvas.zoom;
      let oldPan = state.canvas.pan;
      let newZoomLevel;

      let gridXCenter = ((state.canvas.dimensions.width - oldPan.leftPadding)/2 - oldPan.x)/oldZoomLevel / GRID_SIZE;
      let gridYCenter = ((state.canvas.dimensions.height - oldPan.bottomPadding)/2 - oldPan.y)/oldZoomLevel / GRID_SIZE;

      if (shouldZoomIn) {
        newZoomLevel = oldZoomLevel * 1.1;
      } else {
        newZoomLevel = oldZoomLevel / 1.1;
      }

      let newPanX = (state.canvas.dimensions.width - oldPan.leftPadding)/2 - gridXCenter*GRID_SIZE*newZoomLevel
      let newPanY = (state.canvas.dimensions.height - oldPan.bottomPadding)/2 - gridYCenter*GRID_SIZE*newZoomLevel

      state.canvas = Object.assign({}, state.canvas, {zoom: newZoomLevel, pan: Object.assign({}, oldPan, {x: newPanX, y: newPanY}), zoomFit: false});
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
    },
    canvasDimensions(state) {
      return state.canvas.dimensions;
    },
  }
})
