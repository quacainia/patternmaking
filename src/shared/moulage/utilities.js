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
      context.beginPath();
      context.lineWidth = curveStyle.lineWidth || 3;
      context.strokeStyle = curveStyle.color || "#000";
      context.setLineDash((curveStyle.dashed) ? [5, 5] : []);
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
  return new Curve({points: [start, end], options});
}

export function drawPoint(context, point) {
  let size = point.size || 4;
  context.beginPath();
  context.arc(...point.canvas(), size, 0, 2 * Math.PI, false);
  context.fillStyle = "#FFF";
  context.fill();
  context.lineWidth = size*.75;
  context.strokeStyle = "#900";
  context.stroke();
}

export function drawPointLabel(context, point, label, pattern) {
  let offsetRight = 0, offsetBottom = 0, textMetrics,
      textWidth, textHeight;
  let {labelColor = "#000", labelDefaultDir = "W", labelFont = '18pt serif'} = pattern || {};

  let dir = point.labelDir || labelDefaultDir;

  context.font = labelFont;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  textMetrics = context.measureText(label);
  textWidth = textMetrics.width;
  textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

  if (dir.indexOf("E") > -1) {
    offsetRight = textWidth;
  }
  if (dir.indexOf("W") > -1) {
    offsetRight = - textWidth;
  }
  if (dir.indexOf("S") > -1) {
    offsetBottom = textHeight;
  }
  if (dir.indexOf("N") > -1) {
    offsetBottom = - textHeight;
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
      // console.log("return", newDist, lastDist, N);
      // console.log("t =", t);
      return lastDist;
    }
    lastDist = newDist;
    prevValue = currentValue;
  }
  // console.log("end of loop");
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
    - Alternative to length. Distance of final point to a line passing through
      the start point at an angle perpendicular to the start angle.
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

  while (N--) {
    let currentPoint, dx, dy,plotPoint, linePoint,
        scalePoint, tSq;

    if (tReverse && t > tReverse) {
      tSq = (2*tReverse - t) ** 2;
      if (!midPoint) {
        let angle;
        midPoint = eulerPointsList[eulerPointsList.length - 1];
        flip = true;
        angle = (new Point([prevValue.x, prevValue.y])).getAngle(new Point([currentValue.x, currentValue.y]));
        compensationAngle = 2 * (((angle + 2*Math.PI) % Math.PI) - Math.PI/2);
      }
    } else {
      tSq = t*t;
    }

    dx = Math.cos(tSq) * dt;
    dy = Math.sin(tSq) * dt;
    t += dt;
    prevValue = currentValue;
    currentValue = {
      x: prevValue.x + dx * (flip ? -1 : 1),
      y: prevValue.y + dy * (isLeftHanded ? -1 : 1),
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
        return new Curve({points: eulerPointsList, curveLength, tMax: t, options});
      }
    } else if (currentDist >= endDistance) {
      return new Curve({points: eulerPointsList, curveLength, tMax: t, options});
    } else if (currentDist < prevDist) {
      // TODO: Include this in the renaming of distance / length
      return new Curve({error: 'maxLengthError', points: eulerPointsList, endDistance: currentDist, tMax: t, curveLength, options});
    }
    prevDist = currentDist;
  }
  if (isNaN(eulerPointsList[eulerPointsList.length-1].x) || isNaN(eulerPointsList[eulerPointsList.length-1].y)) {
    // console.error("NaN values in Euler Spiral");
    return new Curve({error: 'containsNaNValues', options});
  }
  if (endDistance && maxPoints === 1000) {
    // console.log('end');
    return new Curve({error: 'ranOutOfPoints', options});
  }
  return new Curve({points: eulerPointsList, curveLength, tMax: t, options});
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
  let points = curve.points.slice();
  points.pop();
  points.push(endPoint);
  points[0] = startPoint;
  curve = new Curve(Object.assign({}, curve, {points}));

  return curve;
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

  dist = endPoint.distToLine(startLine, canvasDimensions);
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

    if (!initialCurve.points) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter += 1;
      continue;
    }

    // move points
    curve = initialCurve.move(endPoint.subv(lastPoint));

    // for each point if point is still "inside"
    pointsAreInsideCurve = true;
    minInsidePointsDist = dist*2;
    for (let iInsidePoints = 0; iInsidePoints < insidePoints.length; iInsidePoints++) {
      let {isPointInCurve, minDist} = getPointInsideCurve(curve.points, insidePoints[iInsidePoints]);
      pointsAreInsideCurve &= isPointInCurve;
      minInsidePointsDist = Math.min(minDist, minInsidePointsDist);
    }
    if (pointsAreInsideCurve) {
      if (minInsidePointsDist < maxInsidePointDist) {
        let points = curve.points.slice();
        points.pop();
        points.push(endPoint);
        curve = new Curve(Object.assign({}, curve, {points}));
        break;
      } else {
        t0 = t0 - (0.5**i);
      }
    } else {
      t0 = t0 + (0.5**i);
    }
    if (t0 < 0) {
      scale *= 1.25;
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
      let points = curve.points.slice();
      points.pop();
      points.push(endPoint);
      points[0] = startPoint;
      curve = new Curve(Object.assign({}, curve, {points}));
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
    newCurve = movedCurve;
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
  if (Math.abs(Px) === Infinity || Math.abs(Py) === Infinity || isNaN(Px) || isNaN(Py) || Px > canvasDimensions.x.max || Px < canvasDimensions.x.min || Py > canvasDimensions.y.max || Py < canvasDimensions.y.min) {
    // TODO: Handle these errors better
    console.error("Intersection error:", {Px, Py});
    return null
  }
  return new Point([Px, Py], options);
}

export function mitreDart(dartPoint, foldToPoint, dartLegFoldToSide, dartLegFoldAwaySide, canvasDimensions, options) {

  let dartAngle, dartMidPoint, foldToPointRotated, mitredMidPoint;

  dartAngle = dartPoint.getAngle(dartLegFoldToSide) - dartPoint.getAngle(dartLegFoldAwaySide);

  foldToPointRotated = foldToPoint.rotate(dartPoint, - dartAngle);

  dartMidPoint = getPointAlongLine(dartLegFoldToSide, dartLegFoldAwaySide, dartLegFoldToSide.distTo(dartLegFoldAwaySide)/2);

  mitredMidPoint = getIntersection(dartPoint, dartMidPoint, dartLegFoldAwaySide, foldToPointRotated, canvasDimensions, options);

  return mitredMidPoint;
}


// console.log(EULER_SCALE_SMALL, getMaxEulerLength(EULER_SCALE_SMALL));
// console.log(EULER_SCALE_STD, getMaxEulerLength(EULER_SCALE_STD));
// console.log(EULER_SCALE_LARGE, getMaxEulerLength(EULER_SCALE_LARGE));



