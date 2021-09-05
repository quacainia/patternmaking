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
  let {isLeftHanded, length, lengthParallel, N, rotationAngle, scale, startPoint, t0} = Object.assign(
    {},
    {
      isLeftHanded: false,
      length: null,
      lengthParallel: null,
      N: 1000,
      rotationAngle: 0,
      scale: EULER_SCALE_STD,
      startPoint: new Point([0, 0]),
      t0: 0,
    },
    options
  );
  let T = 2, dt = 0.002, t = t0, prevValue = {x: 0, y: 0}, prevDist,
      pointList = [startPoint], currentDist, startAngle;

  while (N--) {
    let currentValue, currentPoint, dx, dy,plotPoint, linePoint,
        scalePoint;

    dx = Math.cos(t*t) * dt;
    dy = Math.sin(t*t) * dt;
    t += dt;
    currentValue = {
      x: prevValue.x + dx,
      y: prevValue.y + dy * (isLeftHanded ? -1 : 1)
    };
    currentPoint = new Point([currentValue.x, currentValue.y]);
    scalePoint = currentPoint.mult(scale);
    linePoint = startPoint.addv(scalePoint);
    if ((rotationAngle + 2*Math.PI) % (2*Math.PI) !== 0) {
      plotPoint = linePoint.rotate(startPoint, rotationAngle);
    } else {
      plotPoint = linePoint;
    }
    pointList.push(plotPoint);

    currentDist = startPoint.distTo(linePoint);
    if (lengthParallel) {
      if (!startAngle) {
        startAngle = startPoint.getAngle(pointList[1]);
      }
      let pointAngle = startAngle - startPoint.getAngle(plotPoint);
      if (currentDist * Math.cos(pointAngle) >= lengthParallel) {
        return pointList;
      }
    } else if (currentDist >= length) {
      return pointList;
    }
    prevValue = currentValue;
  }
  if (N > 0 && length && currentDist < length) {
    return null;
  }
  if (isNaN(pointList[pointList.length-1].x) || isNaN(pointList[pointList.length-1].y)) {
    console.error("NaN values in Euler Spiral");
    return null;
  }
  return pointList;
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
  let newOptions = Object.assign({}, options, {N: 1, rotationAngle: 0});
  pointList = getEuler(newOptions);

  return pointList[0].getAngle(pointList[1]);
}

function drawEulerParallelStart(startPoint, endPoint, parallelStartPoint) {
  let dist, endAngle, isLeftHanded, pointList, rotationAngle, scale, t0 = 0;

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  rotationAngle = startPoint.getAngle(parallelStartPoint);
  endAngle = startPoint.getAngle(endPoint);
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {initialAngle: rotationAngle});
  dist = startPoint.distTo(endPoint);
  context.lineWidth = 3;
  context.strokeStyle = "#000";

  for (let i = 1; i<=8; i++) {
    let angleDiff, lastPoint;

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

    pointList = getEuler(options);
    lastPoint = pointList[pointList.length-1];

    if (!pointList) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
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
      continue;
    }
  }

  context.beginPath();
  pointList.forEach(point => context.lineTo(...point.canvas()));
  context.stroke();
}

function drawEulerMidpoint(startPoint, midPoint, endPoint) {
  let dist, endAngle, isLeftHanded, pointList, scale, t0 = 0;

  scale = chooseEulerSize(startPoint.distTo(endPoint));
  isLeftHanded = chooseEulerLeftHanded(startPoint, endPoint, {midPoint});
  dist = startPoint.distTo(endPoint);
  endAngle = startPoint.getAngle(endPoint);
  context.lineWidth = 3;
  context.strokeStyle = "#000";

  iter = 0;

  for (let i = 1; i<=8; i++) {
    let angleDiff, lastPoint;

    if (iter > 10) {
      console.error("Something went wrong!");
      break;
    }

    options = {
      isLeftHanded,
      length: dist,
      scale,
      startPoint,
      t0,
    }
    pointList = getEuler(options);

    if (!pointList) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter += 1;
      continue;
    }

    // rotate points
    let rotateAngle = startPoint.getAngle(pointList[pointList.length-1]) - endAngle;

    for (let p = 0; p<pointList.length; p++) {
      pointList[p] = pointList[p].rotate(startPoint, -rotateAngle);
    }
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
    t = 0;
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
  context.lineWidth = 1;
  context.strokeStyle = "#F00";

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

    eulerPointList = getEuler(options);
    lastPoint = eulerPointList[eulerPointList.length-1];

    if (!eulerPointList) {
      scale *= 1.25;
      t0 = 0;
      i = 0;
      iter += 1;
      continue;
    }

    // move points

    pointList = eulerPointList.map(point => point.addv(endPoint).subv(lastPoint));

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

function drawEulerSpiral(startPoint, options) {
  let {
    endPoint,
    initialT,
    isLeftHanded,
    parallelStartPoint,
    rotation,
    scale
  } = Object.assign(
    {},
    {
      endPoint: null,
      initialT: 0,
      isLeftHanded: false,
      parallelStartPoint: null,
      rotation: 0,
      scale: EULER_SCALE_STD,
    },
    options
  );
  let dx, dy, t=0, current, N=1000, T=3;
  let dt = T/N;
  let lastDist = 0;
  context.lineWidth = 1;
  context.strokeStyle = "#f00";

  if (parallelStartPoint) {
    rotation = startPoint.getAngle(parallelStartPoint);
  }

  let pathDist = startPoint.distTo(endPoint);
  let pointList;

  for (let i = 1; i<=8; i++) {
    let prev = {x:0, y:0}, rotationAngle=rotation;
    if (t !== 0) {
      let point1 = new Point([0,0])
      let dx = Math.cos(t*t)*dt;
      let dy = Math.sin(t*t)*dt;
      let point2 = new Point([dx, dy]);
      rotDiff = point1.getAngle(point2);
      rotationAngle -= rotDiff;
    }
    N=1000
    let plotPoint = startPoint;
    pointList = [startPoint];
    while (N--) {
      dx = Math.cos(t*t) * dt;
      dy = Math.sin(t*t) * dt;
      t += dt;
      current = {
        x: prev.x + dx,
        y: prev.y + dy * (isLeftHanded ? -1 : 1)
      };
      currentPoint = new Point([current.x, current.y])
      scalePoint = currentPoint.mult(scale);
      linePoint = startPoint.addv(scalePoint);
      if (rotationAngle % (2*Math.PI) !== 0) {
        plotPoint = linePoint.rotate(startPoint, -rotationAngle);
      } else {
        plotPoint = linePoint;
      }
      prev = current;

      let newDist = startPoint.distTo(linePoint);
      if (startPoint.distTo(plotPoint) > pathDist) {
        if (startPoint.getAngle(endPoint) <  startPoint.getAngle(plotPoint)) {
          initialT = t = initialT - (0.5**i);
        } else {
          initialT = t = initialT + (0.5**i);
        }
        break;
      }
      pointList.push(plotPoint);
    }
    if (endPoint.distTo(pointList[pointList.length - 2]) < 0.0625 || endPoint.distTo(plotPoint) < 0.0625) {
      break;
    }
  }

  context.beginPath();
  pointList.forEach(point => context.lineTo(...point.canvas()));
  context.stroke();
}

function drawEulerSpiralThreePoint(startPoint, midPoint, endPoint) {
  let initialT = 0, T = 3, dt = T/1000, isLeftHanded = true, scale = EULER_SCALE_STD,
      pointList, pathDist = startPoint.distTo(endPoint);
  for (let i = 1; i<=8; i++) {
    let N=1000, prevValue = {x:0, y:0}, currentPoint = startPoint,
        lastDist = 0;
    pointList = [];
    t=initialT;
    while (N--) {
      dx = Math.cos(t*t) * dt;
      dy = Math.sin(t*t) * dt;
      t += dt;
      currentValue = {
        x: prevValue.x + dx,
        y: prevValue.y + dy * (isLeftHanded ? -1 : 1)
      };
      currentPoint = new Point([currentValue.x, currentValue.y])
      scalePoint = currentPoint.mult(scale);
      linePoint = startPoint.addv(scalePoint);
      pointList.push(linePoint);
      let newDist = startPoint.distTo(linePoint);
      if (startPoint.distTo(linePoint) > pathDist) {
        break;
      }
      if (newDist < lastDist) {
        scale *= 1.25;
        i = 0;
        break;
      }
      prevValue = currentPoint;
      lastDist = newDist;
    }
    if (i <= 0) {
      initialT = 0;
      continue;
    }
    // rotate points
    let rotateAngle = startPoint.getAngle(pointList[pointList.length-1]) - startPoint.getAngle(endPoint);
    for (let p = 0; p<pointList.length; p++) {
      pointList[p] = pointList[p].rotate(startPoint, -rotateAngle);
    }
    // // for each point if point is still "inside"
    let isPointInCurve = true;
    for (let p=0; p<pointList.length/10; p++) {
      pointIndex = p*10
      if (pointIndex === pointList.length) {
        break;
      }

      let lineAngle = pointList[pointIndex].getAngle(pointList[pointIndex+1]);
      let midPointAngle = pointList[pointIndex].getAngle(midPoint);
      let angleDiff = (midPointAngle - lineAngle + 2*Math.PI) % (2*Math.PI);

      // if (Math.abs(midPointAngle) < 0.1) {
      //   console.log(pointList[pointIndex], pointList[pointIndex+1]);
      //   console.log(lineAngle, midPointAngle)
      //   console.log(angleDiff);
      // }
      if ((isLeftHanded && angleDiff > Math.PI) || (!isLeftHanded && angleDiff < Math.PI)) {
        // console.log("OUTSIDE");
        isPointInCurve = false;
        break;
      }
    }
    if (isPointInCurve) {
      initialT = t = initialT - (0.5**i);
    } else {
      initialT = t = initialT + (0.5**i);
    }
    if (initialT < 0) {
      initialT = 0;
      scale *= 1.25;
      i = 0;
      continue;
    }
    t = 0;
  }
  // console.log('draw', pointList.length);
  // console.log(scale);
  context.beginPath();
  pointList.forEach(point => context.lineTo(...point.canvas()));
  context.stroke();
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

function mitreDart(dartPoint, foldToPoint, dartLegFoldToSide, dartLegFoldAwaySide, foldAwayPoint, backPoints) {
  // let [] = sidePoints;

  let dartAngle, dartLegFoldAwaySideNew, dartLegFoldToSideNew, dartMidPoint,
      dartMidPointNew, foldToPointRotated;

  dartAngle = dartPoint.getAngle(dartLegFoldToSide) - dartPoint.getAngle(dartLegFoldAwaySide);

  backPoints["C'"] = foldToPointRotated = foldToPoint.rotate(dartPoint, - dartAngle);
  
  backPoints["J'*"] = dartLegFoldAwaySideNew = getIntersection(foldToPointRotated, foldAwayPoint, dartPoint, dartLegFoldAwaySide);
  backPoints["J'*"].labelDir = 'NE';

  backPoints["J*"] = dartLegFoldToSideNew = dartLegFoldAwaySideNew.rotate(dartPoint, dartAngle);
  backPoints["J*"].labelDir = 'NW';

  backPoints["J."] = dartMidPoint = getPointAlongLine(dartLegFoldToSide, dartLegFoldAwaySide, dartLegFoldToSide.distTo(dartLegFoldAwaySide) / 2);
  backPoints["J."].labelDir = 'S';

  backPoints["J.*"] = dartMidPointNew = getIntersection(dartLegFoldAwaySideNew, foldAwayPoint, dartPoint, dartMidPoint);

  backPoints["J.*"].labelDir = 'N';

  return [dartLegFoldToSideNew, dartMidPointNew, dartLegFoldAwaySideNew];
}


// console.log(EULER_SCALE_SMALL, getMaxEulerLength(EULER_SCALE_SMALL));
// console.log(EULER_SCALE_STD, getMaxEulerLength(EULER_SCALE_STD));
// console.log(EULER_SCALE_LARGE, getMaxEulerLength(EULER_SCALE_LARGE));
