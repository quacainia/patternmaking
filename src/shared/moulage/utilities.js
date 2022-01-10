import {Point, Curve} from './classes.js';
import {BACKGOUND_COLOR, EULER_MAX_LENGTH, EULER_SCALE_LARGE, EULER_SCALE_STD, GRID_SIZE} from './constants.js';

export function draw(canvas, canvasOptions, pattern) {
  const scale = canvasOptions.zoom;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(canvasOptions.pan.x + canvasOptions.pan.leftPadding, canvasOptions.pan.y);
  context.scale(scale, scale);

  const canvasDetails = {
    width: canvas.width/scale,
    height: canvas.height/scale,
    scale,
    offset: {
      ...canvasOptions.pan,
    }
  };

  grid(canvasDetails, context, GRID_SIZE, 1);
  grid(canvasDetails, context, GRID_SIZE/2, 1/2);
  grid(canvasDetails, context, GRID_SIZE/4, 1/4);

  if (pattern && pattern.displayPieces) {
    Object.keys(pattern.displayPieces).forEach((key) => {
      let patternPiece = pattern.displayPieces[key];
      if (patternPiece.curves) {
        drawCurves(context, patternPiece);
      }
    });
    Object.keys(pattern.displayPieces).forEach((key) => {
      let patternPiece = pattern.displayPieces[key];
      if (patternPiece.points) {
        drawPoints(context, patternPiece);
      }
    });
  }

  context.restore();
}

export function drawCurves(context, pattern) {
  Object.keys(pattern.curves).forEach((key) => {
    let curve = pattern.curves[key]
    if (curve) {
      let curveStyle = curve.curveStyle || {};
      let lineWidth = curveStyle.lineWidth || 3;
      context.beginPath();
      context.lineWidth = lineWidth;
      context.strokeStyle = curveStyle.color || "#000";
      context.setLineDash((curveStyle.dashed) ? [5, 4*lineWidth] : []);
      curve.points.forEach(point => context.lineTo(...point.canvas()));
      context.stroke();
    } else {
      console.error(`Null curve: ${key}`)
    }
  });
}

export function drawPoints(context, pattern) {
  Object.keys(pattern.points).forEach((key) => {
    drawPoint(context, pattern.points[key]);
    drawPointLabel(context, pattern.points[key], key, pattern);
  });
}

export function grid(canvasDetails, context, size, width) {
  let {scale, offset} = canvasDetails;
  let {x, leftPadding, y} = offset;
  let xOffset = (x + leftPadding) / scale;
  let yOffset = y / scale;
  let startX = (xOffset % size) - xOffset - size;
  let startY = (yOffset % size) - yOffset - size;
  for (let i = 0; (i-2)*size < canvasDetails.height; i++) {
    context.beginPath();
    context.moveTo(- 1 - xOffset, i*size+startY);
    context.lineTo(canvasDetails.width + 1 - xOffset, i*size+startY);
    context.lineWidth = width;
    context.strokeStyle = "#DDD"
    context.lineCap = 'round';
    context.stroke();
  }
  for (let i = 0; (i-2)*size < canvasDetails.width; i++) {
    context.beginPath();
    context.moveTo(i*size+startX, -1 - yOffset);
    context.lineTo(i*size+startX, canvasDetails.height + 1 - yOffset);
    context.lineWidth = width;
    context.strokeStyle = "#DDD"
    context.lineCap = 'round';
    context.stroke();
  }
}

export function getLine(start, end, options) {
  return new Curve({points: [start, end]}, options);
}

export function drawPoint(context, point) {
  let size = point.size || 4;
  context.beginPath();
  context.arc(...point.canvas(), size, 0, 2 * Math.PI, false);
  context.fillStyle = "#FFF";
  context.fill();
  context.lineWidth = size*.75;
  context.strokeStyle = "#900";
  context.setLineDash([]);
  context.stroke();
}

export function drawPointLabel(context, point, label, pattern) {
  let offsetRight = 0, offsetBottom = 0, textMetrics,
      textWidth, textHeight;
  let {labelColor = "#000", labelDefaultDir = "W", labelFont = '18pt serif'} = {...pattern, ...point};

  let dir = point.labelDir || labelDefaultDir;
  let pointPadding = (point.size || 4) / 2 + 8;

  context.font = labelFont;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  textMetrics = context.measureText(label);
  textWidth = textMetrics.width;
  textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

  if (dir.indexOf("E") > -1) {
    offsetRight = textWidth / 2 + pointPadding;
  }
  if (dir.indexOf("W") > -1) {
    offsetRight = - (textWidth / 2 + pointPadding);
  }
  if (dir.indexOf("S") > -1) {
    offsetBottom = textHeight / 2 + pointPadding;
  }
  if (dir.indexOf("N") > -1) {
    offsetBottom = - (textHeight / 2 + pointPadding);
  }
  const offsetPoint = point.addvCanvas([offsetRight, offsetBottom])

  context.fillStyle = BACKGOUND_COLOR;
  context.fillRect(
    offsetPoint.canvasX() - textMetrics.actualBoundingBoxLeft,
    offsetPoint.canvasY() - textMetrics.actualBoundingBoxAscent,
    textMetrics.width,
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent,
  );

  context.fillStyle = labelColor;
  context.fillText(label, ...offsetPoint.canvas());
}

export function getMaxEulerLength(scale) {
  let t = 0, T=3, N = 10000, dt=T/N, prevValue = {x:0, y:0},
      origin = new Point([0,0]), newDist, lastDist = 0;

  while (N--) {
    let currentPoint, currentValue, dx, dy, scalePoint;
    dx = Math.cos(t*t) * dt;
    dy = Math.sin(t*t) * dt;
    t += dt;
    currentValue = {
      x: prevValue.x + dx,
      y: prevValue.y + dy,
    };
    currentPoint = new Point([currentValue.x, currentValue.y]);
    scalePoint = currentPoint.mult(scale);
    newDist = origin.distTo(scalePoint);
    if (newDist < lastDist) {
      return lastDist;
    }
    lastDist = newDist;
    prevValue = currentValue;
  }
}

export function chooseEulerSize(dist) {
  let scale;
  let values = Object.values(EULER_MAX_LENGTH);
  for (let i=0; i<values.length; i++) {
    if (values[i] > dist) {
      return Object.keys(EULER_MAX_LENGTH)[i];
    }
  }
  scale = EULER_SCALE_LARGE;
  for (let i=0; i<10; i++) {
    let max;
    scale *= 1.25;
    max = getMaxEulerLength(scale);
    EULER_MAX_LENGTH[scale] = max;
    if (max > dist) {
      return scale;
    }
  }
}

export function getEuler(options) {
  /*
  Options:
  - curveStyle
    - Styling to give to the curve object
  - endDistance
    - Straight line distance that the curve should stop at
  - endDistanceParallel
    - Alternative to distance. Distance of final point to a line passing through
      the start point at an angle perpendicular to the start angle.
  - endLength
    - Alternative to distance. The length at which the curve ends.
  - isLeftHanded
    - Whether the curve should bend left (ccw) or right (cw)
  - maxPoints
    - Maximum number of points to plot in the curve
  - measureLength
    - Return the length along the curve.
  - rotationAngle
    - Angle to rotate curve by around the start poin
  - scale
    - Scale of the curve
  - startPoint
    - Initial point the curve starts at
  - t0
    - The initial t value to start the curve at. This affects the intial angle.
  - tReverse
    - Value of t at which to reverse the curve and start plotting it in the
      negative direction
  */
  options  = Object.assign(
    {},
    {
      endDistance: null,
      endDistanceParallel: null,
      endLength: null,
      isLeftHanded: false,
      maxPoints: 2000,
      measureLength: false,
      rotationAngle: 0,
      scale: EULER_SCALE_STD,
      startPoint: new Point([0, 0]),
      t0: 0,
      tReverse: null,
    },
    options
  );
  let {
    endDistance,
    endDistanceParallel,
    endLength,
    isLeftHanded,
    maxPoints,
    measureLength,
    rotationAngle,
    scale,
    startPoint,
    t0,
    tReverse
  } = options
  let dt = 0.001, t = t0, prevValue = {x: 0, y: 0}, prevDist,
      eulerPointsList = [startPoint], currentDist, startAngle, N = maxPoints-1,
      curveLength = 0, flip = false, currentValue = prevValue, midPoint,
      compensationAngle;
  measureLength = measureLength || !!endLength;

  while (N--) {
    let currentPoint, dx, dy,plotPoint, linePoint,
        scalePoint, tSq;

    if (tReverse && t >= tReverse) {
      tSq = (2*tReverse - t) ** 2;
      if (!midPoint) {
        let angle;
        midPoint = eulerPointsList[eulerPointsList.length - 1];
        flip = true;
        if (eulerPointsList.length > 1) {
          angle = (new Point([prevValue.x, prevValue.y])).getAngle(new Point([currentValue.x, currentValue.y]));
        } else {
          dx = Math.cos(tSq) * dt;
          dy = Math.sin(tSq) * dt * (isLeftHanded ? -1 : 1);
          let tempNextValue = {
            x: prevValue.x + dx,
            y: prevValue.y + dy,
          }
          angle = (new Point([prevValue.x, prevValue.y])).getAngle(new Point([tempNextValue.x, tempNextValue.y]));
        }
        compensationAngle = 2 * (((angle + 2*Math.PI) % Math.PI) - Math.PI/2);
      }
    } else {
      tSq = t*t;
    }

    dx = Math.cos(tSq) * dt * (flip ? -1 : 1);
    dy = Math.sin(tSq) * dt * (isLeftHanded ? -1 : 1);
    t += dt;
    prevValue = currentValue;
    currentValue = {
      x: prevValue.x + dx,
      y: prevValue.y + dy,
    };
    currentPoint = new Point([currentValue.x, currentValue.y]);
    scalePoint = currentPoint.mult(scale);
    linePoint = startPoint.addv(scalePoint);
    if (midPoint && compensationAngle) {
      linePoint = linePoint.rotate(midPoint, compensationAngle);
    }
    if ((rotationAngle + 2*Math.PI) % (2*Math.PI) !== 0) {
      plotPoint = linePoint.rotate(startPoint, rotationAngle);
    } else {
      plotPoint = linePoint;
    }
    eulerPointsList.push(plotPoint);
    if (measureLength) {
      // TODO: Rename distance, it's such an ambiguous name.
      curveLength += plotPoint.distTo(eulerPointsList[eulerPointsList.length-2]);
    }


    currentDist = startPoint.distTo(plotPoint);
    if (endDistanceParallel) {
      if (!startAngle) {
        startAngle = startPoint.getAngle(eulerPointsList[1]);
      }
      let pointAngle = startAngle - startPoint.getAngle(plotPoint);
      if (currentDist * Math.cos(pointAngle) >= endDistanceParallel) {
        return new Curve({points: eulerPointsList, curveLength, tMax: t}, options);
      }
    } else if (endDistance) {
      if (currentDist >= endDistance) {
        return new Curve({points: eulerPointsList, curveLength, tMax: t}, options);
      } else if (currentDist < prevDist) {
        // TODO: Include this in the renaming of distance / length
        return new Curve({error: 'maxLengthError', points: eulerPointsList, endDistance: currentDist, tMax: t, curveLength}, options);
      }
    } else if (endLength && curveLength >= endLength) {
      return new Curve({points: eulerPointsList, curveLength, tMax: t}, options);
    }
    prevDist = currentDist;
  }
  if (isNaN(eulerPointsList[eulerPointsList.length-1].x) || isNaN(eulerPointsList[eulerPointsList.length-1].y)) {
    // console.error("NaN values in Euler Spiral");
    return new Curve({error: 'containsNaNValues'}, options);
  }
  if ((endDistance || endDistanceParallel) && maxPoints === 2000) {
    return new Curve({error: 'ranOutOfPoints'}, options);
  }
  return new Curve({points: eulerPointsList, curveLength, tMax: t}, options);
}

export function chooseEulerLeftHanded(startPoint, endPoint, options) {
  let { initialAngle, midPoint } = options;
  let diffAngle, endAngle, startAngle;

  if (isNaN(initialAngle)) {
    if (midPoint) {
      startAngle = startPoint.getAngle(midPoint);
    } else {
      console.error("chooseEulerLeftHanded: Ill-defined options.");
      return null;
    }
  } else {
    startAngle = initialAngle;
  }

  endAngle = startPoint.getAngle(endPoint);

  diffAngle = (endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI);

  if (diffAngle < Math.PI) {
    return true;
  }
  return false;
}

export function getEulerInitialAngle(options) {
  let newOptions = Object.assign({}, options, {maxPoints: 2, rotationAngle: 0});
  let eulerPointsList = getEuler(newOptions).points;

  return eulerPointsList[0].getAngle(eulerPointsList[1]);
}

export function getEulerParallelStart(startPoint, endPoint, parallelStartPoint) {
  let dist, endAngle, isLeftHanded, iter, curve, rotationAngle, scale, t0 = 0;

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  rotationAngle = startPoint.getAngle(parallelStartPoint);
  endAngle = startPoint.getAngle(endPoint);
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {initialAngle: rotationAngle});
  dist = startPoint.distTo(endPoint);

  for (let i = 1; i<=8; i++) {
    let angleDiff, initialAngleEuler, lastPoint, options;

    if (iter > 10) {
      throw "runaway loop";
    }

    options = {
      isLeftHanded,
      endDistance: dist,
      rotationAngle,
      scale,
      startPoint,
      t0,
    }

    initialAngleEuler = getEulerInitialAngle(options);

    options.rotationAngle = rotationAngle-initialAngleEuler;

    curve = getEuler(options);
    lastPoint = curve.points[curve.points.length-1];

    if (!curve.points) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter++;
      continue;
    }

    if (lastPoint.distTo(endPoint) < 1/32) {
      // TODO: Fix this so that endPoint doesn't make a notch in the curve a la addCurveEndpointAndRotateToTrue
      //       This one should be fixed by moving instead of rotating.
      let points = curve.points.slice();
      points.pop();
      points.push(endPoint);
      curve = new Curve(Object.assign({}, curve, {points}));
      break;
    }

    angleDiff = endAngle - startPoint.getAngle(lastPoint);
    if ((isLeftHanded && angleDiff < 0) || (!isLeftHanded && angleDiff > 0)) {
      t0 = t0 - (0.5**i);
    } else {
      t0 = t0 + (0.5**i);
    }
    if (t0 < 0) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter++;
      continue;
    }
  }

  return curve;
}

export function getEulerParallelEnd(startPoint, endPoint, parallelEndPoint, options) {
  let curve, dist, endAngle, isLeftHanded, iter=0, parallelAngle, scale, t0 = 0;
  let {insidePoint, outsidePoint} = Object.assign(
    {},
    {
      insidePoint: null,
      outsidePoint: null,
    },
    options
  )

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  parallelAngle = endPoint.getAngle(parallelEndPoint);
  endAngle = startPoint.getAngle(endPoint);
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {midPoint: parallelEndPoint});
  dist = startPoint.distTo(endPoint);

  for (let i = 1; i<=8; i++) {
    let angleDiff, eulerOptions, lastPoint;

    if (iter > 10) {
      throw "runaway loop";
    }

    eulerOptions = {
      isLeftHanded,
      endDistance: dist,
      scale,
      startPoint,
      t0,
    }

    let initialCurve = getEuler(eulerOptions);
    lastPoint = initialCurve.points[initialCurve.points.length-1];

    if (!initialCurve.points) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter++;
      continue;
    }

    //rotate
    let endOfCurveAngle = lastPoint.getAngle(initialCurve.points[initialCurve.points.length - 2]);
    let rotateAngle = parallelAngle - endOfCurveAngle;
    curve = initialCurve.rotate(rotateAngle, {origin: startPoint});
    lastPoint = curve.points[curve.points.length - 1];

    if (lastPoint.distTo(endPoint) < 1/32) {
      if (insidePoint) {
        let {isPointInCurve} = getPointInsideCurve(curve.points, insidePoint);
        if (!isPointInCurve) {
          scale *= 1.25;
          t0 = 0;
          i = 0;
          iter++;
          continue;
        }
      }
      if (outsidePoint) {
        let {isPointInCurve} = getPointInsideCurve(curve.points, outsidePoint);
        if (isPointInCurve) {
          scale /= 1.25;
          t0 = 0;
          i = 0;
          iter++;
          continue;
        }
      }
      // TODO: Fix this so that endPoint doesn't make a notch in the curve a la addCurveEndpointAndRotateToTrue
      //       This one should be fixed by moving instead of rotating.
      let points = curve.points.slice();
      points.pop();
      points.push(endPoint);
      points[0] = startPoint;
      curve = new Curve(Object.assign({}, curve, {points}));
      break;
    }

    angleDiff = endAngle - startPoint.getAngle(lastPoint);
    if (!((isLeftHanded && angleDiff < 0) || (!isLeftHanded && angleDiff > 0))) {
      t0 = t0 - (0.5**i);
    } else {
      t0 = t0 + (0.5**i);
    }
    if (t0 < 0) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter++;
      continue;
    }
  }

  return curve;
}

export function getEulerMidpoint(startPoint, midPoint, endPoint, curveOptions) {
  let curve, dist, endAngle, isLeftHanded, iter = 0, scale, t0 = 0;

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {midPoint});
  dist = startPoint.distTo(endPoint);
  endAngle = startPoint.getAngle(endPoint);

  for (let i = 1; i<=8; i++) {
    let initialCurve, rotateAngle;

    if (iter > 10) {
      throw "drawEulerMidpoint: Too many iterations.";
    }

    let options = {
      ...curveOptions,
      isLeftHanded,
      endDistance: dist,
      scale,
      startPoint,
      t0,
    }
    initialCurve = getEuler(options);

    if (!initialCurve.points) {
      if (i > 1) {
        t0 = t0 - (0.5**i);
      }
      if (i === 1 || t0 < 0) {
        scale *= 1.25;
        t0 = 0;
        i = 1;
        iter += 1;
      }
      i--;
      continue;
    }

    // rotate points
    rotateAngle = endAngle - startPoint.getAngle(initialCurve.points[initialCurve.points.length-1]);
    curve = initialCurve.rotate(rotateAngle);

    // // for each point if point is still "inside"
    let {isPointInCurve} = getPointInsideCurve(curve.points, midPoint);
    if (isPointInCurve) {
      t0 = t0 - (0.5**i);
    } else {
      t0 = t0 + (0.5**i);
    }
    if (t0 < 0) {
      t0 = 0;
      scale *= 1.25;
      i = 0;
      iter += 1;
      continue;
    }
  }

  return addCurveEndpointAndRotateToTrue(curve, endPoint);
}

export function getEulerPerpendicularWithPointInside(endPoint, insidePoints, startLine, canvasDimensions, options) {
  let {isLeftHanded, maxInsidePointDist} = Object.assign(
    {},
    {
      maxInsidePointDist: 0.5,
    },
    options
  );
  let curve, dist, iter=0, scale, t0 = 0;
  let initialAngle = endPoint.angleToLine(startLine, canvasDimensions);

  dist = endPoint.distToLine(new Curve({points: startLine}), canvasDimensions);
  scale = chooseEulerSize(dist);
  if (isLeftHanded === undefined) {
    isLeftHanded = chooseEulerLeftHanded(insidePoints[0], endPoint, {initialAngle});
  }

  for (let i = 1; i<=8; i++) {
    let initialAngleEuler, initialCurve, lastPoint, minInsidePointsDist,
        pointsAreInsideCurve;

    if (iter > 10) {
      console.error("drawEulerParallelWithPointInside: Too many iterations.");
      break;
    }

    options = {
      ...options,
      isLeftHanded,
      endDistanceParallel: dist,
      rotationAngle: initialAngle,
      scale,
      t0,
    }

    initialAngleEuler = getEulerInitialAngle(options);

    options.rotationAngle = initialAngle-initialAngleEuler;

    initialCurve = getEuler(options);
    lastPoint = initialCurve.points[initialCurve.points.length-1];

    if (!initialCurve.points || !initialCurve.points.length) {
      scale *= 1.118;
      t0 = 0;
      i = 0;
      iter += 1;
      continue;
    }

    // move points
    let movedCurve = initialCurve.move(endPoint.subv(lastPoint));

    // for each point if point is still "inside"
    pointsAreInsideCurve = true;
    minInsidePointsDist = dist*2;
    for (let iInsidePoints = 0; iInsidePoints < insidePoints.length; iInsidePoints++) {
      let {isPointInCurve, minDist} = getPointInsideCurve(movedCurve.points, insidePoints[iInsidePoints]);
      pointsAreInsideCurve &= isPointInCurve;
      minInsidePointsDist = Math.min(minDist, minInsidePointsDist);
    }
    if (pointsAreInsideCurve) {
      if (minInsidePointsDist < maxInsidePointDist) {
        // TODO: Fix this so that endPoint doesn't make a notch in the curve a la addCurveEndpointAndRotateToTrue
        //       This one should be fixed by moving instead of rotating.
        let points = movedCurve.points.slice();
        points.pop();
        points.push(endPoint);
        curve = new Curve(Object.assign({}, movedCurve, {points}));
        break;
      } else {
        t0 = t0 - (0.5**i);
      }
    } else {
      t0 = t0 + (0.5**i);
    }
    if (t0 < 0) {
      scale *= 1.118;
      t0 = 0;
      i = 0;
      iter += 1;
      continue;
    }
  }
  return curve;
}

export function getEulerOfMeasurementWithInsidePoint(startPoint, insidePoint, endPoint, measurement, curveOptions) {
  let curve, dist, endAngle, isLeftHanded, iter = 0, scale, t0 = 0, 
      t0Delta = 0.1, tReverse, options;
  const ITERATIONS = 5;
  // startPoint = startPoint.addv(new Point([0, 5]));
  // endPoint = endPoint.addv(new Point([0, 5]))

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {midPoint: insidePoint});
  dist = startPoint.distTo(endPoint);
  endAngle = startPoint.getAngle(endPoint);

  for (let i = 1; i<=ITERATIONS; i++) {

    if (iter > 10) {
      console.error("Something went wrong!");
      break;
    }

    options = {
      ...curveOptions,
      isLeftHanded,
      endDistance: dist,
      measureLength: true,
      scale,
      startPoint,
      t0,
      tReverse
    }
    let initialCurve = getEuler(options);

    if (initialCurve.error) {
      let tReversePct = 0.5
      for (let ii = 1; ii <=10; ii++) {
        options.tReverse = initialCurve.tMax * tReversePct;

        let initialReverseCurve = getEuler(options);

        // rotate points
        let rotateAngle = endAngle - startPoint.getAngle(initialReverseCurve.points[initialReverseCurve.points.length-1]);
        curve = initialReverseCurve.rotate(rotateAngle);

        if (Math.abs(curve.curveLength - measurement) < 1/16) {
          break;
        }
        if (initialReverseCurve.error || curve.curveLength < measurement) {
          tReversePct += 0.5 ** (ii+1);
        } else {
          tReversePct -= 0.5 ** (ii+1);
        }
      }
    } else {
      // rotate points
      let rotateAngle = endAngle - startPoint.getAngle(initialCurve.points[initialCurve.points.length-1]);
      curve = initialCurve.rotate(rotateAngle);
    }

    let {isPointInCurve} = getPointInsideCurve(curve.points, insidePoint)
    if (isPointInCurve && Math.abs(curve.curveLength - measurement) < 1/16) {
      curve.points[0] = startPoint;
      curve = addCurveEndpointAndRotateToTrue(curve, endPoint);
      break;
    } else if (curve.curveLength < measurement) {
      t0 = t0 + (t0Delta);
    } else {
      t0Delta /= 2;
      t0 = t0 - (t0Delta);
    }
    if (i === ITERATIONS) {
      console.error("Ran out of iterations");
      return null
      // TODO: lower EL'
    }
  }

  return curve;
}

export function getFlippedEulerPerpendicularWithPointInside(
    curve, endPoint, insidePoints, startLine, canvasDimensions, options) {
  options = {patternPieceName: undefined, ...options};
  let newCurve, originalCurve;

  let flippedCurve = curve.flip(0)
  let movedCurve = flippedCurve.move(endPoint.subv(flippedCurve.points[flippedCurve.points.length - 1]));

  let pointsAreInsideCurve = true;
  for (let i=0; i < insidePoints.length; i++) {
    let {isPointInCurve} = getPointInsideCurve(movedCurve.points, insidePoints[i]);
    if (!isPointInCurve) {
      pointsAreInsideCurve = false;
      break;
    }
  }

  if (!pointsAreInsideCurve) {
    newCurve = getEulerPerpendicularWithPointInside(endPoint, insidePoints, startLine, canvasDimensions, options);

    let unflippedCurve = newCurve.flip(0);
    originalCurve = unflippedCurve.move(curve.points[curve.points.length-1].subv(unflippedCurve.points[unflippedCurve.points.length - 1]));
    let points = originalCurve.points.slice();
    points.pop();
    points.push(curve.points.slice().pop());
    originalCurve = new Curve(Object.assign({}, originalCurve, {points}));
  } else {
    newCurve = new Curve(movedCurve, options);
    originalCurve = curve;
  }
  return {flipped: newCurve, original: originalCurve};
}

export function getPointInsideCurve(curve, point) {
  let isPointInCurve = true, minDist = curve[0].distTo(point);
  let isLeftHanded = (((curve[0].getAngle(curve[curve.length-1]) - curve[0].getAngle(curve[1])) + 2*Math.PI) % (2*Math.PI) < Math.PI);

  for (let p=0; p<curve.length/10; p++) {
    let angleDiff, lineAngle, midPointAngle;

    let pointIndex = p*10
    if (pointIndex === curve.length-1) {
      break;
    }

    minDist = Math.min(curve[pointIndex].distTo(point), minDist);
    lineAngle = curve[pointIndex].getAngle(curve[pointIndex+1]);
    midPointAngle = curve[pointIndex].getAngle(point);
    angleDiff = (midPointAngle - lineAngle + 2*Math.PI) % (2*Math.PI);

    if ((isLeftHanded && angleDiff > Math.PI) || (!isLeftHanded && angleDiff < Math.PI)) {
      isPointInCurve = false;
      break;
    }
  }
  return {isPointInCurve, minDist}
}

export function pixelsToGridVector(values) {
  return new Point(values.map((d) => (d) / GRID_SIZE));
}

export function getPointAlongLine(point1, point2, distance, options) {
  // https://math.stackexchange.com/a/175906
  let v = point2.subv(point1);
  let n = v.norm()
  let u = v.div(n);
  if (options && options.name && !options.generatedInstructions) {
    options.generatedInstructions = `Establish point ${options.name} ${Math.abs(distance)} inches from ${point1.name} along line ${point1.name}-${point2.name}`;
  }
  return point1.addv(u.mult(distance), options);
}

export function getPointOnLineClosestToPoint(line, point, canvasDimensions, options) {
  /*
  If you have a line and a point that does not lie on the line, this export function
  will get the point that lies along the line that is closest to the point.
  That would be the intersection point of the line and a normal line that
  passes through the point.
  */

  let perpendicularLineAngle = line[0].getAngle(line[1]);
  let perpendicularPoint = point.toAngleDistance(
    perpendicularLineAngle + Math.PI/2, 1);
  return getIntersection(point, perpendicularPoint, line[0], line[1], canvasDimensions, options);
}

export function getPointAlongLineDistanceFromPoint(line, point, distance, canvasDimensions, options) {
  /*
  From point you want to draw a line of a specified distance where the
  terminating point lies along the line.

  Since there are two solutions, this will chose the one closer to the first
  point in the line.
  */

  let solution1, solution2;

  let normalPoint = getPointOnLineClosestToPoint(line, point, canvasDimensions);
  let distanceFromPointToNormal = point.distTo(normalPoint);
  let distanceFromNormalAlongLine = Math.sqrt(distance**2 - distanceFromPointToNormal**2);
  if (isNaN(distanceFromNormalAlongLine)) {
    console.error("getPointAlongLineDistanceFromPoint: distance not close enough to line provides", line, point, distance, distanceFromPointToNormal);
    return null;
  }
  if (options && options.name && !options.generatedInstructions) {
    options.generatedInstructions = `Establish point ${options.name} ${distance} inches from point ${point.name} along line ${line[0].name}-${line[1].name}`;
  }
  solution1 = getPointAlongLine(normalPoint, line[0], distanceFromNormalAlongLine, options);
  solution2 = getPointAlongLine(normalPoint, line[0], - distanceFromNormalAlongLine, options);
  if (line[0].distTo(solution1) < line[0].distTo(solution2)) {
    return solution1;
  }
  return solution2;
}

export function getIntersection(line1Point1, line1Point2, line2Point1, line2Point2, canvasDimensions, options) {

  let x1 = line1Point1.values[0];
  let y1 = line1Point1.values[1];
  let x2 = line1Point2.values[0];
  let y2 = line1Point2.values[1];
  let x3 = line2Point1.values[0];
  let y3 = line2Point1.values[1];
  let x4 = line2Point2.values[0];
  let y4 = line2Point2.values[1];

  // From Wikipedia / linear algebra
  let D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  let Px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/D;
  let Py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/D;
  if (Math.abs(Px) === Infinity || Math.abs(Py) === Infinity || isNaN(Px) || isNaN(Py) || (canvasDimensions && (Px > canvasDimensions.x.max || Px < canvasDimensions.x.min || Py > canvasDimensions.y.max || Py < canvasDimensions.y.min))) {
    // TODO: Handle these errors better
    console.error("Intersection error:", {Px, Py});
    return null
  }

  if (options && options.name && !options.generatedInstructions) {
    options.generatedInstructions = `Establish point ${options.name} at the intersection of ${line1Point1.name}-${line1Point2.name} and ${line2Point1.name}-${line2Point2.name}`;
  }
  return new Point([Px, Py], options);
}

export function getIntersectionLines(line1, line2, canvasDimensions, options) {
  return getIntersection(
    line1.points[0],
    line1.points[1],
    line2.points[0],
    line2.points[1],
    canvasDimensions,
    options
  );
}

export function isLineInDirectionOf(point, directionPoint, line, canvasDimensions) {
  let intersection = getIntersectionLines(new Curve({points: [point, directionPoint]}), line, canvasDimensions);
  
  // Lots of weird math to get approximately equal even for 0.01 and 359.99
  let dpAngle = Math.round(point.getAngle(directionPoint)*180/Math.PI)%360
  let intsctAngle = Math.round(point.getAngle(intersection)*180/Math.PI)%360;

  return dpAngle == intsctAngle;
}

export function mitreDart(dartPoint, foldToPoint, dartLegFoldToSide, dartLegFoldAwaySide, canvasDimensions, options) {

  let dartAngle, dartMidPoint, foldToPointRotated, mitredMidPoint;

  dartAngle = dartPoint.getAngle(dartLegFoldToSide) - dartPoint.getAngle(dartLegFoldAwaySide);

  foldToPointRotated = foldToPoint.rotate(dartPoint, - dartAngle);

  dartMidPoint = getPointAlongLine(dartLegFoldToSide, dartLegFoldAwaySide, dartLegFoldToSide.distTo(dartLegFoldAwaySide)/2);

  mitredMidPoint = getIntersection(dartPoint, dartMidPoint, dartLegFoldAwaySide, foldToPointRotated, canvasDimensions, options);

  return mitredMidPoint;
}

export function getPointOnCurveLineIntersection(curve, line, canvasDimensions, options) {
  let iter = 0;
  let test_segments = [
    [0, curve.points.length-1],
    [0, Math.floor((curve.points.length - 1)/2), curve.points.length -1]
  ];
  let found_lines = [], found_points = [];

  for (;;) {
    iter++
    let new_test_segments = [];

    for (let i=0; i<test_segments.length; i++) {
      if (test_segments[i].length == 2) {
        let start = test_segments[i][0];
        let end = test_segments[i][1];

        // Test if points straddle line
        if (curve.points[start].distToLine(line) > 0 != curve.points[end].distToLine(line) > 0) {
          if (end - start == 1) {
            found_lines.push(new Curve({points: [curve.points[start], curve.points[end]]}));
          } else {
            let middle = Math.floor((end - start) / 2)+start;
            new_test_segments.push([start, middle]);
            new_test_segments.push([middle, end]);
          }
        } else {
          // Test if curve points toward the poin on both sides
          // TODO: This method could have consequences if curves do loops and stuff
          let isStartInDirOfLine = isLineInDirectionOf(
            curve.points[start],
            curve.points[start+1],
            line,
            canvasDimensions
          );
          let isEndInDirOfLine = isLineInDirectionOf(
            curve.points[end],
            curve.points[end-1],
            line,
            canvasDimensions
          );
          if (isStartInDirOfLine && isEndInDirOfLine) {
            let middle = Math.floor((end - start) / 2)+start;
            new_test_segments.push([start, middle]);
            new_test_segments.push([middle, end]);
          }
        }

      }

    }
    test_segments = new_test_segments;
    if (!test_segments.length) {
      break;
    }
    if (iter > 12) {
      console.error("getPointOnCurveLineIntersection", "MAX ITER");
      break;
    }
  }

  if (options && options.name && !options.generatedInstructions) {
    options.generatedInstructions = `Establish point ${options.name} at the intersection of ${curve.name} and ${line.name}`;
  }

  found_lines.forEach((found_line) => {
    found_points.push(getIntersectionLines(
      line,
      found_line,
      canvasDimensions,
      options,
    ));
  });

  return found_points;
}

export function getPointAlongCurve(point, curve, distanceGoal, options) {
  let {useReverseDirection} = options;
  let curveSegment, newPoint;
  let distanceSum = 0;
  let curveFromPoint = getCurveFromMidpoint(curve, point, useReverseDirection);
  if (options && options.name && !options.generatedInstructions) {
    options.generatedInstructions = `Establish point ${options.name} ${distanceGoal} inches from ${point.name} along ${curve.name}`;
  }
  
  for(let i=1; i<curveFromPoint.points.length; i++) {
    let point1 = curveFromPoint.points[i-1];
    let point2 = curveFromPoint.points[i];
    let pointsDist = point1.distTo(point2);
    if (distanceSum + pointsDist > distanceGoal) {
      newPoint = getPointAlongLine(point1, point2, distanceGoal - distanceSum, options);
      curveSegment = new Curve({'points': [...curveFromPoint.points.slice(0, i), newPoint]})
      break;
    } else {
      distanceSum += pointsDist;
    }
  }
  return {
    'pointAlongCurve': newPoint,
    'curveToPoint': curveSegment,
  }
}

export function getCurveFromMidpoint(curve, point, useReverseDirection) {
  let min = 1e-5;
  let minPointIdx = -1;
  let newCurve;
  for (let i=1; i<curve.points.length; i++) {
    let p1 = curve.points[i-1];
    let p2 = curve.points[i];
    let YXdiff = (p1.y - p2.y) * point.x + p1.y * (p1.x - p2.x) - (p1.y - p2.y) * p1.x;
    let pointYXdiff = point.y * (p1.x - p2.x);
    let diff = Math.abs(YXdiff - pointYXdiff);
    if (diff < min) {
      if (
        diff == 0 ||
        (
          (p2.x - point.x < 0) != (p1.x - point.x < 0)
        ) && (
          (p2.y - point.y < 0) != (p1.y - point.y < 0)
        )
      ) {
        min = diff;
        minPointIdx = i;
      }
    }
  }
  if (minPointIdx < 0) {
    // TODO: Handle this error better
    // console.error("Failed to find midpoint on curve.");
    return;
  }

  let pointsSlice;
  if (useReverseDirection) {
    pointsSlice = curve.points.slice(0, minPointIdx).reverse();
  } else {
    pointsSlice = curve.points.slice(minPointIdx);
  }
  let newPoints = [point, ...pointsSlice];
  newCurve = new Curve({...curve, 'points': newPoints, name: undefined, options: {...curve.options, name: undefined}});
  return newCurve;
}

export function elongateCurve(curve, elongateOptions, options) {
  let endDistance, endDistanceParallel, endLength;
  if (elongateOptions?.endDistance) {
    endDistance = elongateOptions.endDistance;
  } else if (elongateOptions?.endDistanceParallel) {
    endDistanceParallel = elongateOptions.endDistanceParallel;
  } else if (elongateOptions?.endLength) {
    endLength = elongateOptions.endLength;
  } else {
    return null;
  }
  let newCurve = getEuler({...curve, endDistance, endDistanceParallel, endLength, ...options});
  return newCurve;
}

export function getCurveEndsFromTwoMidpoints(curve, midPoint1, midPoint2) {
  let curve1 = getCurveFromMidpoint(curve, midPoint1);
  if (!curve1) {
    return;
  }
  let curve2 = getCurveFromMidpoint(curve, midPoint2);
  if (!curve2) {
    return;
  }
  if (curve1.points.length > curve2.points.length) {
    curve1 = getCurveFromMidpoint(curve, midPoint1, true);
  } else if (curve1.points.length == curve2.points.length) {
    let dist1 = curve1.points[0].distTo(curve1.points[1]);
    let dist2 = curve2.points[0].distTo(curve2.points[1]);
    if (dist1 > dist2) {
      curve1 = getCurveFromMidpoint(curve, midPoint1, true);
    } else {
      curve2 = getCurveFromMidpoint(curve, midPoint2, true);
    }
  } else {
    curve2 = getCurveFromMidpoint(curve, midPoint2, true);
  }

  return [curve1, curve2];
}

export function manipulateDart(pointOfRotation, closingDart, openingDart, curvesToManipulate) {
  // TODO: Find points within the angle of manipulation, and use history
  //       tracking to determine which curves are associated with those
  //       points. This would remove the need for curvesToManipulate.
  //       This unfortunately doesn't cover lines like SU.

  let closeDartManipulatingPoint, closeDartStationaryPoint, openDartManipulatingPoint, openDartStationaryPoint;

  closeDartManipulatingPoint = (closingDart[0].points[0].approx(pointOfRotation)) ? closingDart[0].points[closingDart[0].points.length - 1] : closingDart[0].points[0];
  closeDartStationaryPoint = (closingDart[1].points[0].approx(pointOfRotation)) ? closingDart[1].points[closingDart[1].points.length - 1] : closingDart[1].points[0];
  openDartManipulatingPoint = (openingDart[0].points[0].approx(pointOfRotation)) ? openingDart[0].points[openingDart[0].points.length - 1] : openingDart[0].points[0];
  openDartStationaryPoint = (openingDart[1].points[0].approx(pointOfRotation)) ? openingDart[1].points[openingDart[1].points.length - 1] : openingDart[1].points[0];

  let angleToManPoint = pointOfRotation.getAngle(closeDartManipulatingPoint);
  let angleToStatPoint = pointOfRotation.getAngle(closeDartStationaryPoint);

  let angleOfManipulation = ((angleToStatPoint - angleToManPoint) + 2*Math.PI) % (2*Math.PI)
  
  let manipulatedParts = [];
  let unmanipulatedParts = [];
  let deletedCurves = [closingDart[0]];

  curvesToManipulate.push(openingDart[0]);

  curvesToManipulate.forEach(curve => {
    let curveSegments = getCurveEndsFromTwoMidpoints(curve, closeDartManipulatingPoint, closeDartStationaryPoint);
    if (!curveSegments) {
      curveSegments = getCurveEndsFromTwoMidpoints(curve, openDartManipulatingPoint, openDartStationaryPoint);
    }
    if (curveSegments) {
      deletedCurves.push(curve);
      curveSegments.forEach(curveSeg => {
        if (curveSeg.points.indexOf(closeDartManipulatingPoint) >= 0 || curveSeg.points.indexOf(openDartManipulatingPoint) >= 0) {
          curve = curveSeg;
        } else {
          unmanipulatedParts.push(curveSeg)
        }
      });
    }
    let {newCurve, namedPoints} = curve.rotate(angleOfManipulation, {origin: pointOfRotation, getNamedPoints: true});
    manipulatedParts = manipulatedParts.concat(namedPoints);
    manipulatedParts.push(newCurve);
  });
  return {
    deleted: deletedCurves,
    manipulated: manipulatedParts,
    unmanipulated: unmanipulatedParts,
  };
}

export function cutDarts(darts) {
  return darts.map(dart => new Curve(
    {...dart, instructions: 'undefined'},
    {
      generatedInstructions: `With scissors, cut dart along ${dart.name} to but not through the pivot point.`
    }
  ));
}

export function copyCurve(curve, anchorPoint, destPoint, options, pointOptions) {
  options = {patternPieceName: undefined, ...options};
  pointOptions = {patternPieceName: undefined, ...pointOptions};
  let newCurve = curve;
  options = {...options};

  if (options.reverse) {
    newCurve = newCurve.reverse();
  }

  if (options.flip) {
    newCurve = newCurve.flip();
  }

  newCurve = newCurve.move(anchorPoint.subv(newCurve.points[0]));

  let distanceCurve = elongateCurve(newCurve, {endLength: anchorPoint.distTo(destPoint)});

  newCurve = distanceCurve.rotate(
    anchorPoint.getAngle(destPoint)
    - distanceCurve.points[0].getAngle(distanceCurve.points[distanceCurve.points.length - 1])
  );

  let lastPoint = new Point(newCurve.points[newCurve.points.length - 1], pointOptions);
  newCurve.points[0] = anchorPoint;
  newCurve.points[newCurve.points.length - 1] = lastPoint
  newCurve = new Curve(newCurve, options);

  return {
    curve: newCurve,
    endPoint: lastPoint,
  }
}

export function addCurveEndpointAndRotateToTrue(curve, endPoint) {
  let points = curve.points.slice();
  let startPoint = points[0];
  let lastPoint = points[points.length - 1];
  let secondLastPoint = points[points.length - 2];
  let distPoint = getPointAlongLineDistanceFromPoint([lastPoint, secondLastPoint], startPoint, startPoint.distTo(endPoint));
  if (angleApprox(secondLastPoint.getAngle(distPoint), secondLastPoint.getAngle(lastPoint))) {
    if (secondLastPoint.distTo(distPoint) < secondLastPoint.distTo(lastPoint)) {
      points.pop();
    }
    let angle = startPoint.getAngle(endPoint) - startPoint.getAngle(distPoint);
    curve = new Curve({...curve, points}).rotate(angle);
    points = curve.points.slice()
    points[0] = startPoint;
    points.push(endPoint);
    let newCurve = new Curve({...curve, points});
    return newCurve
  } else {
    // If the second to last point is also past the endpoint
    console.error("addCurveEndpointAndRotateToTrue", "Incomplete code!");
    // This should be an impossible condition if built with getEuler({endDistance})
    // But in the case that it happens my hypothesized code was the following, but
    // recursion is scary.

    // points.pop()
    // curve.points = points
    // return addCurveEndpointAndRotateToTrue(cruve, endPoint);

  }
}

function angleApprox(angle1, angle2, margin=0.001) {
  return Math.abs(angle1 - angle2) < margin;
}

// console.log(EULER_SCALE_SMALL, getMaxEulerLength(EULER_SCALE_SMALL));
// console.log(EULER_SCALE_STD, getMaxEulerLength(EULER_SCALE_STD));
// console.log(EULER_SCALE_LARGE, getMaxEulerLength(EULER_SCALE_LARGE));



