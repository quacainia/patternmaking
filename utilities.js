const BACKGOUND_COLOR = '#FFF';
const EULER_SCALE_SMALL = 5.4;
const EULER_SCALE_STD = 6.75;
const EULER_SCALE_LARGE = 8.4375;
const GRID_SIZE = 30;
const GRID_OFFSET = [4,4];

let EULER_MAX_LENGTH = {}
EULER_MAX_LENGTH[EULER_SCALE_SMALL] = 6.42372;
EULER_MAX_LENGTH[EULER_SCALE_STD] = 8.02965;
EULER_MAX_LENGTH[EULER_SCALE_LARGE] = 10.03706;

function grid(size, width, zero) {
  for (var i = 0; i*size < canvas.width; i++) {
    context.beginPath();
    context.moveTo(-1, i*size+zero[1]);
    context.lineTo(canvas.width+1, i*size+zero[1]);
    context.lineWidth = width;
    context.strokeStyle = "#DDD"
    context.lineCap = 'round';
    context.stroke();
  }
  for (var i = 0; i*size < canvas.width; i++) {
    context.beginPath();
    context.moveTo(i*size+zero[0], -1);
    context.lineTo(i*size+zero[0], canvas.height+1);
    context.lineWidth = width;
    context.strokeStyle = "#DDD"
    context.lineCap = 'round';
    context.stroke();
  }
}

function drawLine(start, end, options) {
  let {color = "#000", lineWidth = 3} = (options ? options : {});

  if (Array.isArray(start)) {
    start = new Point(start);
  }
  if (Array.isArray(end)) {
    end = new Point(end);
  }

  context.beginPath();
  context.moveTo(...start.canvas());
  context.lineTo(...end.canvas());
  context.lineWidth = lineWidth;
  context.strokeStyle = color;
  context.lineCap = 'round';
  context.stroke();
}

function drawPoint(point) {
  context.beginPath();
  context.arc(...point.canvas(), 2, 0, 2 * Math.PI, false);
  context.fillStyle = "#FFF";
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = "#900";
  context.stroke();
}

function drawPointLabel(point, label, options) {
  let offsetRight = 0, offsetBottom = 0, textMetrics,
      {color = "#000", dir = "W"} = options ? options : {};

  if (point.labelDir) {
    dir = point.labelDir;
  }

  context.font = '10pt serif';
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

  context.fillStyle = color;
  context.fillText(label, ...offsetPoint.canvas());
}

function getMaxEulerLength(scale) {
  let t = 0, T=3, N = 10000, dt=T/N, prevValue = {x:0, y:0},
      origin = new Point([0,0]), newDist, lastDist = 0;

  while (N--) {
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

function chooseEulerSize(dist) {
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

function getEuler(options) {
  /*
  Options:
  - isLeftHanded
    - Whether the curve should bend left (ccw) or right (cw)
  - length
    - Straight line distance that the curve should stop at
  - lengthParallel
    - Alternative to length. Distance of final point to a line passing through
      the start point at an angle perpendicular to the start angle.
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
  let {
    isLeftHanded,
    length,
    lengthParallel,
    maxPoints,
    measureLength,
    rotationAngle,
    scale,
    startPoint,
    t0,
    tReverse
  } = Object.assign(
    {},
    {
      isLeftHanded: false,
      length: null,
      lengthParallel: null,
      maxPoints: 1000,
      measureLength: false,
      rotationAngle: 0,
      scale: EULER_SCALE_STD,
      startPoint: new Point([0, 0]),
      t0: 0,
      tReverse: null,
    },
    options
  );
  let T = 2, dt = 0.002, t = t0, prevValue = {x: 0, y: 0}, prevDist,
      eulerPointsList = [startPoint], currentDist, startAngle, N = maxPoints-1,
      distance = 0, reverseAngle, flip = false, currentValue = prevValue, midPoint,
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
      distance += plotPoint.distTo(eulerPointsList[eulerPointsList.length-2]);
    }


    currentDist = startPoint.distTo(plotPoint);
    if (lengthParallel) {
      if (!startAngle) {
        startAngle = startPoint.getAngle(eulerPointsList[1]);
      }
      let pointAngle = startAngle - startPoint.getAngle(plotPoint);
      if (currentDist * Math.cos(pointAngle) >= lengthParallel) {
        return {eulerPointsList, distance, tMax: t};
      }
    } else if (currentDist >= length) {
      return {eulerPointsList, distance, tMax: t};
    } else if (currentDist < prevDist) {
      // TODO: Include this in the renaming of distance / length
      return {error: 'maxLengthError', eulerPointsList, currentDist, tMax: t, distance};
    }
    prevDist = currentDist;
  }
  if (isNaN(eulerPointsList[eulerPointsList.length-1].x) || isNaN(eulerPointsList[eulerPointsList.length-1].y)) {
    // console.error("NaN values in Euler Spiral");
    return {error: 'containsNaNValues'};
  }
  if (length && maxPoints === 1000) {
    // console.log('end');
    return {error: 'ranOutOfPoints'};
  }
  return {eulerPointsList, distance, tMax: t};
}

function chooseEulerLeftHanded(startPoint, endPoint, options) {
  let { initialAngle, midPoint } = options;
  let startAngle;

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

function getEulerInitialAngle(options) {
  let newOptions = Object.assign({}, options, {maxPoints: 2, rotationAngle: 0});
  let {eulerPointsList} = getEuler(newOptions);

  return eulerPointsList[0].getAngle(eulerPointsList[1]);
}

function drawEulerParallelStart(startPoint, endPoint, parallelStartPoint) {
  let dist, endAngle, isLeftHanded, iter, curvePoints, rotationAngle, scale, t0 = 0;

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  rotationAngle = startPoint.getAngle(parallelStartPoint);
  endAngle = startPoint.getAngle(endPoint);
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {initialAngle: rotationAngle});
  dist = startPoint.distTo(endPoint);
  context.lineWidth = 3;
  context.strokeStyle = "#000";

  for (let i = 1; i<=8; i++) {
    let angleDiff, lastPoint;

    if (iter > 10) {
      throw "runaway loop";
    }

    options = {
      isLeftHanded,
      length: dist,
      rotationAngle,
      scale,
      startPoint,
      t0,
    }

    initialAngleEuler = getEulerInitialAngle(options);

    options.rotationAngle = rotationAngle-initialAngleEuler;

    let {eulerPointsList} = getEuler(options);
    curvePoints = eulerPointsList;
    lastPoint = curvePoints[curvePoints.length-1];

    if (!curvePoints) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter++;
      continue;
    }

    if (lastPoint.distTo(endPoint) < 1/32) {
      break;
    }

    angleDiff = endAngle - startPoint.getAngle(lastPoint);
    if ((isLeftHanded && angleDiff < 0) || (!isLeftHanded && angleDiff > 0)) {
      t0 = t0 - (0.5**i);
    } else {
      t0 = t0 + (0.5**i);
    }
    if (t0 < 0) {
      scale += 1.25;
      t0 = 0;
      i = 0;
      iter++;
      continue;
    }
  }

  context.beginPath();
  curvePoints.forEach(point => context.lineTo(...point.canvas()));
  context.stroke();
}

function drawEulerMidpoint(startPoint, midPoint, endPoint) {
  let dist, endAngle, isLeftHanded, iter = 0, pointList, scale, t0 = 0;

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {midPoint});
  dist = startPoint.distTo(endPoint);
  endAngle = startPoint.getAngle(endPoint);
  context.lineWidth = 3;
  context.strokeStyle = "#000";

  for (let i = 1; i<=8; i++) {
    let angleDiff, lastPoint;

    if (iter > 10) {
      throw "drawEulerMidpoint: Too many iterations.";
      break;
    }

    options = {
      isLeftHanded,
      length: dist,
      scale,
      startPoint,
      t0,
    }
    let {eulerPointsList} = getEuler(options);

    if (!eulerPointsList) {
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
    let rotateAngle = startPoint.getAngle(eulerPointsList[eulerPointsList.length-1]) - endAngle;
    pointList = eulerPointsList.map(point => point.rotate(startPoint, -rotateAngle));

    // // for each point if point is still "inside"
    let isPointInCurve = true;
    for (let p=0; p<pointList.length/10; p++) {
      pointIndex = p*10
      if (pointIndex === pointList.length-1) {
        break;
      }

      let lineAngle = pointList[pointIndex].getAngle(pointList[pointIndex+1]);
      let midPointAngle = pointList[pointIndex].getAngle(midPoint);
      let angleDiff = (midPointAngle - lineAngle + 2*Math.PI) % (2*Math.PI);

      if ((isLeftHanded && angleDiff > Math.PI) || (!isLeftHanded && angleDiff < Math.PI)) {
        isPointInCurve = false;
        break;
      }
    }
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
  context.beginPath();
  pointList.forEach(point => context.lineTo(...point.canvas()));
  context.stroke();
}

function drawEulerPerpendicularWithPointInside(endPoint, insidePoint, startLine, initialAngle, options) {
  let {isLeftHanded, maxInsidePointDist} = Object.assign(
    {},
    {
      maxInsidePointDist: 0.25,
    },
    options
  );
  let dist, pointList, scale, t0 = 0;

  dist = endPoint.distToLine(startLine);
  scale = chooseEulerSize(dist*2);
  if (isLeftHanded === undefined) {
    isLeftHanded = chooseEulerLeftHanded(insidePoint, endPoint, {initialAngle});
  }
  context.lineWidth = 3;
  context.strokeStyle = "#000";

  iter = 0;

  for (let i = 1; i<=8; i++) {
    let angleDiff, diffPoint, eulerPointList, initialAngleEuler, isPointInCurve,
        lastPoint, minDist;

    if (iter > 10) {
      console.error("drawEulerParallelWithPointInside: Too many iterations.");
      break;
    }

    options = {
      isLeftHanded,
      lengthParallel: dist,
      rotationAngle: initialAngle,
      scale,
      t0,
    }

    initialAngleEuler = getEulerInitialAngle(options);

    options.rotationAngle = initialAngle-initialAngleEuler;

    let {eulerPointsList} = getEuler(options);
    lastPoint = eulerPointsList[eulerPointsList.length-1];

    if (!eulerPointsList) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter += 1;
      continue;
    }

    // move points
    pointList = eulerPointsList.map(point => point.addv(endPoint).subv(lastPoint));

    // console.error('foo');
    // return;
    // // for each point if point is still "inside"
    isPointInCurve = true;
    minDist = dist;
    for (let p=0; p<pointList.length/10; p++) {
      let angleDiff, lineAngle, midPointAngle;

      pointIndex = p*10
      if (pointIndex === pointList.length-1) {
        break;
      }

      minDist = Math.min(pointList[pointIndex].distTo(insidePoint), minDist);
      lineAngle = pointList[pointIndex].getAngle(pointList[pointIndex+1]);
      midPointAngle = pointList[pointIndex].getAngle(insidePoint);
      angleDiff = (midPointAngle - lineAngle + 2*Math.PI) % (2*Math.PI);

      if ((isLeftHanded && angleDiff > Math.PI) || (!isLeftHanded && angleDiff < Math.PI)) {
        isPointInCurve = false;
        break;
      }
    }
    if (isPointInCurve) {
      if (minDist < maxInsidePointDist) {
        break;
      } else {
        t0 = t0 - (0.5**i);
      }
    } else {
      t0 = t0 + (0.5**i);
    }
    if (t0 < 0) {
      break;
    }
  }
  context.beginPath();
  pointList.forEach(point => context.lineTo(...point.canvas()));
  context.stroke();
}

function drawEulerOfMeasurementWithInsidePoint(startPoint, insidePoint, endPoint, measurement, maxFarAngle) {
  let dist, endAngle, isLeftHanded, iter = 0, pointList, scale, t0 = 0, 
      t0Delta = 0.1, tReverse, options;
  const ITERATIONS = 5;
  // startPoint = startPoint.addv(new Point([0, 5]));
  // endPoint = endPoint.addv(new Point([0, 5]))

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {midPoint: insidePoint});
  dist = startPoint.distTo(endPoint);
  endAngle = startPoint.getAngle(endPoint);
  context.lineWidth = 3;
  context.strokeStyle = "#000";

  for (let i = 1; i<=ITERATIONS; i++) {
    let angleDiff, lastPoint;

    if (iter > 10) {
      console.error("Something went wrong!");
      break;
    }

    options = {
      isLeftHanded,
      length: dist,
      measureLength: true,
      scale,
      startPoint,
      t0,
      tReverse
    }
    let euler = getEuler(options);
    let {eulerPointsList, distance, error, tMax} = euler;

    if (error) {
      tReversePct = 0.5
      for (let ii = 1; ii <=10; ii++) {
        options.tReverse = tMax * tReversePct;

        let innerEuler = getEuler(options);

        // // rotate points
        let rotateAngle = startPoint.getAngle(innerEuler.eulerPointsList[innerEuler.eulerPointsList.length-1]) - endAngle;
        pointList = innerEuler.eulerPointsList.map(point => point.rotate(startPoint, -rotateAngle));

        distance = innerEuler.distance;
        if (Math.abs(distance - measurement) < 1/16) {
          break;
        }
        if (innerEuler.error || distance < measurement) {
          tReversePct += 0.5 ** (ii+1);
        } else {
          tReversePct -= 0.5 ** (ii+1);
        }
      }
      tReverse = tMax * .75;
    } else {
      // // rotate points
      let rotateAngle = startPoint.getAngle(eulerPointsList[eulerPointsList.length-1]) - endAngle;
      pointList = eulerPointsList.map(point => point.rotate(startPoint, -rotateAngle));
    }

    let {isPointInCurve} = getPointInsideCurve(pointList, insidePoint)
    if (isPointInCurve && Math.abs(distance - measurement) < 1/16) {
      break;
    } else if (distance < measurement) {
      t0 = t0 + (t0Delta);
    } else {
      t0Delta /= 2;
      t0 = t0 - (t0Delta);
    }
    if (i === ITERATIONS) {
      console.error("Ran out of iterations");
      pointList = null;
      // TODO: lower EL'
    }
  }
  context.beginPath();
  pointList.forEach(point => context.lineTo(...point.canvas()));
  context.stroke();
}

function getPointInsideCurve(curve, point) {
  let isPointInCurve = true, minDist = curve[0].distTo(point);
  let isLeftHanded = (((curve[0].getAngle(curve[curve.length-1]) - curve[0].getAngle(curve[1])) + 2*Math.PI) % (2*Math.PI) < Math.PI);

  for (let p=0; p<curve.length/10; p++) {
    let angleDiff, lineAngle, midPointAngle;

    pointIndex = p*10
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

function pixelsToGridVector(values) {
  return new Point(values.map((d,i) => (d) / GRID_SIZE));
}

class Point {
  // Really a vector class, but try to ignore that

  constructor(values) {
    this.values = values;
    this.x = values[0];
    this.y = values[1];
  }

  *canvas() {
    let points = this.gridToCanvasCoordinates();
    for(const value of points) {
      yield value;
    }
  }

  gridToCanvasCoordinates() {
    return this.values.map((d,i) => d*GRID_SIZE+GRID_OFFSET[i]);
  }

  add(value) {
    return new Point(this.values.map(d => d + value));
  }

  addv(point2) {
    if (this.values.length === point2.values.length) {
      let res = []
      for(let key in this.values) {
        res[key] = this.values[key] + point2.values[key]
      }
      return new Point(res)
    }
  }

  addvCanvas(values) {
    return this.addv(pixelsToGridVector(values));
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
    let perpendicularLineAngle = line[0].getAngle(line[1]);
    let perpendicularPoint = this.toAngleDistance(
      perpendicularLineAngle + Math.PI/2, 1);
    let intersection = getIntersection(this, perpendicularPoint, line[0], line[1]);
    return this.distTo(intersection);
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

  getAngle(point2) {
    return -Math.atan2((point2.y - this.y), (point2.x - this.x));
  }

  mult(value) {
    return new Point(this.values.map(d => d * value));
  }

  norm() {
    return Math.sqrt(this.dot(this));
  }

  rotate(centerPoint, angle) {
    let rotatedX = Math.cos(angle) * (this.x - centerPoint.x) + Math.sin(angle) * (this.y - centerPoint.y) + centerPoint.x;
    let rotatedY = Math.cos(angle) * (this.y - centerPoint.y) - Math.sin(angle) * (this.x - centerPoint.x) + centerPoint.y;
    return new Point([rotatedX,rotatedY]);
  }

  squareRight(distance) {
    let values = [this.values[0]+distance, this.values[1]];
    return new Point(values);
  }

  squareUp(distance) {
    let values = [this.values[0], this.values[1]-distance];
    return new Point(values);
  }

  sub(value) {
    return new Point(this.values.map(d => d - value));
  }

  subv(point2) {
    if (this.values.length === point2.values.length) {
      let res = []
      for(let key in this.values) {
        res[key] = this.values[key] - point2.values[key]
      }
      return new Point(res)
    }
  }

  toAngleDistance(angle, distance) {
    y = - Math.sin(angle) * distance + this.y;
    x = Math.cos(angle) * distance + this.x;
    return new Point([x, y]);
  }
}

function getPointAlongLine(point1, point2, distance) {
  // https://math.stackexchange.com/a/175906
  let v = point2.subv(point1);
  let n = v.norm()
  let u = v.div(n);
  return point1.addv(u.mult(distance))
}

function getIntersection(line1Point1, line1Point2, line2Point1, line2Point2) {

  x1 = line1Point1.values[0];
  y1 = line1Point1.values[1];
  x2 = line1Point2.values[0];
  y2 = line1Point2.values[1];
  x3 = line2Point1.values[0];
  y3 = line2Point1.values[1];
  x4 = line2Point2.values[0];
  y4 = line2Point2.values[1];

  // From Wikipedia / linear algebra
  D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  Px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/D;
  Py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/D;
  if (Math.abs(Px) === Infinity || Math.abs(Py) === Infinity || isNaN(Px) || isNaN(Py) || Px > frontTop.values[0] || Px < backTop.values[0] || Py > frontBottom.values[1] || Py < frontTop.values[1]) {
    // TODO: Handle these errors better
    console.error("Intersection error:", {Px, Py});
    return null
  }
  return new Point([Px, Py]);
}

function mitreDart(dartPoint, foldToPoint, dartLegFoldToSide, dartLegFoldAwaySide) {

  let dartAngle, dartMidPoint, foldToPointRotated, mitredMidPoint;

  dartAngle = dartPoint.getAngle(dartLegFoldToSide) - dartPoint.getAngle(dartLegFoldAwaySide);

  foldToPointRotated = foldToPoint.rotate(dartPoint, - dartAngle);

  dartMidPoint = getPointAlongLine(dartLegFoldToSide, dartLegFoldAwaySide, dartLegFoldToSide.distTo(dartLegFoldAwaySide)/2);

  mitredMidPoint = getIntersection(dartPoint, dartMidPoint, dartLegFoldAwaySide, foldToPointRotated);

  return mitredMidPoint;
}


// console.log(EULER_SCALE_SMALL, getMaxEulerLength(EULER_SCALE_SMALL));
// console.log(EULER_SCALE_STD, getMaxEulerLength(EULER_SCALE_STD));
// console.log(EULER_SCALE_LARGE, getMaxEulerLength(EULER_SCALE_LARGE));