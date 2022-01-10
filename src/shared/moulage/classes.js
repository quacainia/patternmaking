import {GRID_SIZE} from './constants.js';
import {getPointOnLineClosestToPoint, pixelsToGridVector} from './utilities.js';

export class Pattern {
  constructor(values) {
    values = values || {};
    this.name = values.name;
    this.title = values.title;
    this.description = values.description;
    this.isMasculine = values.isMasculine;
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

      action.patternPieceName = action.patternPieceName ?? patternPieceName;

      if (action.options && action.options.patternPieceName) {
        action.patternPieceName = action.options.patternPieceName;
      }
      let actionPatternPiece = patternPieces[action.patternPieceName];

      if (action.type === 'Point') {
        action.labelDir = action.labelDir || actionPatternPiece.labelDefaultDir;
      }
      actionPatternPiece[action.typeContainer][action.name] = action;
    });

    (step.deleteActions || []).forEach(action => {
      if (!action.name) {
        console.error('Pattern step action does not have a name.', step, action);
        throw 'Pattern step action does not have a name.';
        // TODO: Handle gracefully.
      }

      let actionPatternPiece = patternPieces[action.patternPieceName];
      if (actionPatternPiece && actionPatternPiece[action.typeContainer]) {
        delete actionPatternPiece[action.typeContainer][action.name];
      }
    });
  }

  sliceDisplaySteps(step) {
    let stepsSlice = this.steps.slice(0, step-1);

    let displayPieces = {};

    Object.keys(this.patternPieces).forEach(key => {
      displayPieces[key] = Object.assign(
        {},
        this.patternPieces[key],
        {
          curves: {},
          points: {},
        },
      );
    })

    stepsSlice.forEach(step => {
      step.actions.forEach(action => {
        displayPieces[action.patternPieceName][action.typeContainer][action.name] = action;
      });

      (step.deleteActions || []).forEach((action) => {
        delete displayPieces[action.patternPieceName][action.typeContainer][action.name];
      });
    });

    displayPieces._currentStep = new PatternPiece({
      labelColor: '#B1B',
      labelFont: '28pt serif',
    });

    this.steps[step-1].actions.forEach(action => {
      if (action.hideInstructions) {
        displayPieces[action.patternPieceName][action.typeContainer][action.name] = action;
      } else {
        let patternPiece = displayPieces[action.patternPieceName];
        if (patternPiece) {
          delete patternPiece[action.typeContainer][action.name];
        }
        if (action.type === 'Point') {
          displayPieces._currentStep.points[action.name] = new Point(action, {styleName: 'currentStep'});
        } else {
          displayPieces._currentStep.curves[action.name] = new Curve(action, {styleName: (action.styleName || 'final') + 'Current'});
        }
      }
    });
    (this.steps[step-1].highlights || []).forEach((action, idx) => {
      let name = action.name || `highlight_${idx}`
      if (action.type === 'Point') {
        displayPieces._currentStep.points[name] = new Point(action, {styleName: action.styleName || 'highlight'});
      } else {
        let styleName = action.styleName;
        if (styleName && styleName != 'final') {
          styleName += 'Highlight';
        } else {
          styleName = 'highlight';
        }
        displayPieces._currentStep.curves[name] = new Curve(action, {styleName});
      }
    });
    (this.steps[step-1].deleteActions || []).forEach((action) => {
      delete displayPieces[action.patternPieceName][action.typeContainer][action.name];
    });
    (this.steps[step-1].hide || []).forEach(action => {
      delete displayPieces[action.patternPieceName][action.typeContainer][action.name];
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
    this.labelFont = options.labelFont;
  }
}

export class Point {
  // Really a vector class, but try to ignore that
  type = 'Point'
  typeContainer = 'points'
  optionKeys = [
    'color',
    'generatedInstructions',
    'hideInstructions',
    'instructions',
    'isGuide',
    'labelDefaultDir',
    'labelDir',
    'name',
    'patternPieceName',
    'size',
    'stepId',
    'styleName',
  ]
  newPointClearKeys = {
    'generatedInstructions': undefined,
  }

  constructor(point, options) {

    if (Array.isArray(point)) {
      point = {values: point};
      options = {...options};
    } else {
      point = {...point};
      options = {...point.options, ...options};
    }

    Object.keys(options).forEach(key => {
      if (this.optionKeys.indexOf(key) < 0) {
        delete options[key];
      }
    });

    point = {
      values: [0, 0],
      ...point,
      ...this.newPointClearKeys,
      ...options,
    }
    Object.keys(point).forEach(key => {
      if (point[key]) {
        this[key] = point[key];
      }
    });
    delete this.options;

    this.x = this.values[0];
    this.y = this.values[1];

    switch(this.styleName) {
      case 'currentStep':
        this.color = '#606';
        this.size = 8;
        break;
      case 'highlight':
        this.color = '#4DF';
        this.size = 8;
        break;
      case 'temporary':
        this.color = '#4DF';
        this.size = 4;
        this.labelFont = '18pt serif';
        this.labelColor = '#279';
        break;
    }
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

  distToLine(line) {
    let lp0 = line.points[0];
    let lp1 = line.points[1];
    return (
        (lp1.values[0] - this.values[0]) * (lp0.values[1] - this.values[1]) -
        (lp1.values[1] - this.values[1]) * (lp0.values[0] - this.values[0])
    ) / lp0.distTo(lp1);
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
    if (options && options.name && !options.generatedInstructions) {
      let direction = (distance > 0) ? 'right' : 'left';
      options.generatedInstructions = `Square ${direction} ${Math.abs(distance)} inches from ${this.name} to establish point ${options.name}`;
    }
    return new Point(values, options);
  }

  squareUp(distance, options) {
    let values = [this.values[0], this.values[1]-distance];
    if (options && options.name && !options.generatedInstructions) {
      let direction = (distance > 0) ? 'up' : 'down';
      options.generatedInstructions = `Square ${direction} ${Math.abs(distance)} inches from ${this.name} to establish point ${options.name}`;
    }
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
    if (options && options.name && !options.generatedInstructions) {
      let degrees = angle/Math.PI*180;
      options.generatedInstructions = `Establish point ${options.name} ${distance} inches from ${this.name} at a ${degrees}° angle`;
    }
    return new Point([x, y], options);
  }
}

export class Curve {
  // A long list of points to display as a curve
  type = 'Curve';
  typeContainer = 'curves'
  optionKeys = [
    'curveStyle',
    'endDistance',
    'endDistanceParallel',
    'error',
    'generatedInstructions',
    'hideInstructions',
    'instructions',
    'isLeftHanded',
    'maxInsidePointDist',
    'maxPoints',
    'midPoint',
    'measureLength',
    'mutations',
    'name',
    'patternPieceName',
    'rotationAngle',
    'scale',
    'stepId',
    'styleName',
    't0',
    'tMax',
    'tReverse',
  ]

  constructor(values, options) {
    options = {...values.options, ...options};

    Object.keys(options).forEach(key => {
      if (this.optionKeys.indexOf(key) < 0) {
        delete options[key];
      }
    });

    values = {
      curveLength: null,
      endDistance: null,
      hideInstructions: false,
      isLeftHanded: false,
      mutations: [],
      points: [],
      ...values,
      ...options,
    }
    Object.keys(values).forEach(key => {
      if (values[key]) {
        this[key] = values[key];
      }
    });
    delete this.options;

    let curveStyle = {};
    let styleName = this.styleName;
    switch(styleName) {
      case 'guide':
        curveStyle = {color: "#555", lineWidth: 1};
        break;
      case 'guideCurrent':
        curveStyle = {color: "#F7F", lineWidth: 4};
        break;
      case 'guideHighlight':
        curveStyle = {color: "#4DF", lineWidth: 4};
        break;
      case 'highlight':
        curveStyle = {color: "#4DF", lineWidth: 7};
        break;
      case 'temporary':
        curveStyle = {color: "#555", lineWidth: 1, dashed: true};
        break;
      case 'temporaryCurrent':
        curveStyle = {color: "#F7F", lineWidth: 4, dashed: true};
        break;
      case 'temporaryHighlight':
        curveStyle = {color: "#4DF", lineWidth: 3, dashed: true};
        break;
      case 'finalCurrent':
        curveStyle = {color: "#F2F", lineWidth: 7};
        break;
      case 'final':
      default:
        curveStyle = {color: "#000", lineWidth: 3};
        break;
    }
    let optionsCurveStyle = (this.styleName) ? {} : this.curveStyle;
    this.curveStyle = Object.assign({}, values.curveStyle, curveStyle, optionsCurveStyle);

    this.endPoint = this.points[this.points.length - 1];
    if (!this.name && this.points.length > 1 && this.points[0].name && this.points[this.points.length-1].name) {
      this.name = "" + this.points[0].name + this.points[this.points.length-1].name;
    }

    // this.scale = this.options.scale;
    this.startPoint = this.points && this.points.length && this.points[0];
  }

  flip(index) {
    let angle;

    let newMutations = [...this.mutations];
    newMutations.push({
      type: "flip",
      index,
    })

    index = index || 0;

    if (!index) {
      angle = this.points[index].getAngle(this.points[index+1]);
    } else if (index === this.points.length-1) {
      angle = this.points[index-1].getAngle(this.points[index]);
    } else {
      angle = this.points[index-1].getAngle(this.points[index+1]);
    }

    let rotationAngle = this.rotationAngle || 0;
    rotationAngle = 2 * (angle - rotationAngle);

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
        options: {
          ...this.options,
          isLeftHanded: !this.isLeftHanded,
        },
        rotationAngle
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

  reverse() {
    let points = this.points.slice().reverse();
    let mutations = [...this.mutations];
    mutations.push({
      type: "reverse",
    })

    let rotationAngle = this.rotationAngle || 0;
    if (this.points && this.points.length > 1) {
      let startAngle = this.points[0].getAngle(this.points[1]);
      let endAngle = this.points[this.points.length - 2].getAngle(this.points[this.points.length - 1]);
      let startRotDiff = rotationAngle - startAngle;
      rotationAngle = Math.PI - (startAngle - endAngle * 2) - startRotDiff;
      rotationAngle = (rotationAngle + Math.PI * 2) % (Math.PI * 2);
    }

    return new Curve({
      ...this,
      points,
      options: {
        t0: this.tMax,
        tReverse: this.tReverse || this.tMax,
        tMax: this.t0,
        isLeftHanded: !this.isLeftHanded,
        rotationAngle,
      },
      mutations
    });
  }

  rotate(angle, options) {
    options = Object.assign(
      {},
      {
        origin: this.points[0],
        getNamedPoints: false,
      },
      options
    );
    let {origin, getNamedPoints} = options;
    let namedPoints = [];

    let newMutations = [...this.mutations];
    newMutations.push({
      type: "rotate",
      origin,
      angle,
    });

    let newPoints = this.points.map(point => {
      let newPoint = point.rotate(origin, angle, point);
      if (getNamedPoints && point.name) {
        namedPoints.push(newPoint)
      }
      return newPoint;
    });
    
    let newCurve = new Curve(Object.assign(
      {},
      this,
      {
        points: newPoints,
        rotationAngle: (this.rotationAngle || 0) + angle,
        mutations: newMutations,
        ...options,
      }
    ));

    if (getNamedPoints) {
      return {
        newCurve,
        namedPoints
      }
    }
    return newCurve;
  }
}
