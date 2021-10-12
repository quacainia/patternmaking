import {GRID_SIZE} from './constants.js';
import {getPointOnLineClosestToPoint, pixelsToGridVector} from './utilities.js';

export class Pattern {
  constructor(values) {
    values = values || {};
    this.name = values.name;
    this.title = values.title;
    this.description = values.description;
    this.patternPieces = {}
    this.steps = [];
  }

  addStep(step) {
    // TODO: Validate step
    if (!step.patternPieceName) {
      console.error('Pattern step needs an associated pattern piece name.', step);
      throw 'Pattern step needs an associated pattern piece name.';
      // TODO: Handle gracefully.
    }

    let {actions, patternPieceName} = step;
    let patternPieces = this.patternPieces;
    let stepId = this.steps.length;

    this.steps.push(step);

    actions.forEach(action => {
      if (!action.name) {
        console.error('Pattern step action does not have a name.', step, action);
        throw 'Pattern step action does not have a name.';
        // TODO: Handle gracefully.
      }

      action.stepId = stepId;

      action.patternPieceName = patternPieceName;

      if (action.options && action.options.patternPieceName) {
        action.patternPieceName = action.options.patternPieceName;
      }
      let actionPatternPiece = patternPieces[action.patternPieceName];

      if (action.type === 'point') {
        actionPatternPiece.points[action.name] = action;
      } else {
        actionPatternPiece.curves[action.name] = action;
      }
    });
  }

  sliceDisplaySteps(step) {
    let stepsSlice = this.steps.slice(0, step);

    let displayPieces = {};

    stepsSlice.forEach(step => {
      step.actions.forEach(action => {
        if (!displayPieces[action.patternPieceName]) {
          // This is for keeping styling of the pattern piece
          displayPieces[action.patternPieceName] = Object.assign(
            {},
            this.patternPieces[action.patternPieceName],
            {
              curves: {},
              points: {},
            }
          );
        }
        if (action.type === 'point') {
          displayPieces[action.patternPieceName].points[action.name] = action;
        } else {
          displayPieces[action.patternPieceName].curves[action.name] = action;
        }
      });
    });

    return displayPieces;
  }
}

export class PatternPiece {
  constructor(options) {
    options = options || {};
    this.curves = {};
    this.points = {};
    this.labelColor = options.labelColor;
    this.labelDefaultDir = options.labelDefaultDir;
  }
}

export class Point {
  // Really a vector class, but try to ignore that

  constructor(values, options) {
    this.type = 'point';
    this.values = values;
    this.x = values[0];
    this.y = values[1];

    this.options = options;
    this.name = options && options.name;
    this.isGuide = options && options.isGuide;
    this.labelDir = options && options.labelDir;
  }

  *canvas() {
    let points = this.gridToCanvasCoordinates();
    for(const value of points) {
      yield value;
    }
  }

  gridToCanvasCoordinates() {
    return this.values.map((d) => d*GRID_SIZE);
  }

  add(value, options) {
    return new Point(this.values.map(d => d + value), options);
  }

  addv(point2, options) {
    if (this.values.length === point2.values.length) {
      let res = []
      for(let key in this.values) {
        res[key] = this.values[key] + point2.values[key]
      }
      return new Point(res, options)
    }
  }

  addvCanvas(values) {
    return this.addv(pixelsToGridVector(values));
  }

  angleToLine(line, canvasDimensions) {
    return getPointOnLineClosestToPoint(line, this, canvasDimensions).getAngle(this);
  }

  approx(point2, distance=1/32) {
    return Math.abs(this.x - point2.x) < distance && Math.abs(this.y - point2.y) < distance;
  }

  canvasX() {
    return this.gridToCanvasCoordinates()[0];
  }

  canvasY() {
    return this.gridToCanvasCoordinates()[1];
  }

  distTo(point2) {
    let p = this.subv(point2);
    return Math.sqrt(p.values[0]**2 + p.values[1]**2);
  }

  distToLine(line, canvasDimensions) {
    let pointOnLine = getPointOnLineClosestToPoint(line, this, canvasDimensions);
    return this.distTo(pointOnLine);
  }

  div(value) {
    return this.mult(1/value);
  }

  dot(point2) {
    return this.values.map(
      (d,i) => d * point2.values[i]
    ).reduce(
      (a,b) => a + b
    );
  }

  equal(point2) {
    return this.x === point2.x && this.y === point2.y;
  }

  getAngle(point2) {
    return -Math.atan2((point2.y - this.y), (point2.x - this.x));
  }

  mult(value, options) {
    return new Point(this.values.map(d => d * value), options);
  }

  norm() {
    return Math.sqrt(this.dot(this));
  }

  rotate(centerPoint, angle, options) {
    let rotatedX = Math.cos(angle) * (this.x - centerPoint.x) + Math.sin(angle) * (this.y - centerPoint.y) + centerPoint.x;
    let rotatedY = Math.cos(angle) * (this.y - centerPoint.y) - Math.sin(angle) * (this.x - centerPoint.x) + centerPoint.y;
    return new Point([rotatedX,rotatedY], options);
  }

  squareRight(distance, options) {
    let values = [this.values[0]+distance, this.values[1]];
    return new Point(values, options);
  }

  squareUp(distance, options) {
    let values = [this.values[0], this.values[1]-distance];
    return new Point(values, options);
  }

  sub(value, options) {
    return new Point(this.values.map(d => d - value), options);
  }

  subv(point2, options) {
    if (this.values.length === point2.values.length) {
      let res = []
      for(let key in this.values) {
        res[key] = this.values[key] - point2.values[key]
      }
      return new Point(res, options)
    }
  }

  toAngleDistance(angle, distance, options) {
    let y = - Math.sin(angle) * distance + this.y;
    let x = Math.cos(angle) * distance + this.x;
    return new Point([x, y], options);
  }
}

export class Curve {
  // A long list of points to display as a curve

  constructor(values, options) {
    this.type = 'curve';
    this.points = values.points || [];
    this.options = Object.assign({}, values.options, options);

    this.curveLength = values.curveLength || null;

    let curveStyle = {};
    switch(this.options.styleName) {
      case 'guide':
        curveStyle = {color: "#555", lineWidth: 1};
        break;
      case 'temporary':
        curveStyle = {color: "#555", lineWidth: 1, dashed: true};
        break;
      case 'final':
      default:
        curveStyle = {color: "#000", lineWidth: 3};
        break;
    }
    let optionsCurveStyle = (this.options.styleName) ? {} : this.options.curveStyle;
    this.curveStyle = Object.assign({}, values.curveStyle, curveStyle, optionsCurveStyle);

    this.endDistance = this.options.endDistance || null;
    this.endPoint = this.points[this.points.length - 1];
    this.error = values.error;
    this.isLeftHanded = this.options.isLeftHanded || false;
    this.midPoint = values.midPoint;
    this.mutations = values.mutations || [];

    this.name = this.options.name || values.name;
    if (!this.name && this.points.length > 1 && this.points[0].name && this.points[this.points.length-1].name) {
      this.name = "" + this.points[0].name + this.points[this.points.length-1].name;
    }

    if (values.rotationAngle !== undefined) {
      this.rotationAngle = values.rotationAngle;
    } else {
      this.rotationAngle = this.options.rotationAngle;
    }

    this.scale = this.options.scale;
    this.startPoint = this.points[0];
    this.t0 = this.options.t0;
    this.tMax = values.tMax;
  }

  flip(index) {
    let angle;

    let newMutations = [...this.mutations];
    newMutations.push({
      type: "flip",
      index,
    })

    if (index == 0) {
      angle = this.points[index].getAngle(this.points[index+1]);
    } else if (index === this.points.length-1) {
      angle = this.points[index-1].getAngle(this.points[index]);
    } else {
      angle = this.points[index-1].getAngle(this.points[index+1]);
    }

    let p1 = this.points[index];
    let p2 = p1.toAngleDistance(angle, 1);

    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;

    let a = (dx**2 - dy**2) / (dx**2 + dy**2);
    let b = 2 * dx * dy / (dx**2 + dy**2);

    let newPoints = this.points.map(p => new Point([
      a * (p.x - p1.x) + b*(p.y - p1.y) + p1.x,
      b * (p.x - p1.x) - a*(p.y - p1.y) + p1.y
    ]));

    return new Curve(Object.assign(
      {},
      this,
      {
        points: newPoints,
        mutations: newMutations,
      }
    ));
  }

  move(vector) {
    let newMutations = [...this.mutations];
    newMutations.push({
      type: "move",
      vector,
    });

    let newPoints = this.points.map(point => point.addv(vector));

    return new Curve(Object.assign(
      {},
      this,
      {
        points: newPoints,
        mutations: newMutations,
      }
    ));
  }

  rotate(angle, options) {
    let {origin} = Object.assign(
      {},
      {
        origin: this.points[0],
      },
      options
    );

    let newMutations = [...this.mutations];
    newMutations.push({
      type: "rotate",
      origin,
      angle,
    });

    let newPoints = this.points.map(point => point.rotate(origin, angle));
    return new Curve(Object.assign(
      {},
      this,
      {
        points: newPoints,
        rotationAngle: (this.rotationAngle || 0) + angle,
        mutations: newMutations,
      }
    ));
  }
}
