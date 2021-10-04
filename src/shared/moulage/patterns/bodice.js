import {Pattern, PatternPiece, Point} from '@/shared/moulage/classes.js';
import * as constants from '@/shared/moulage/constants.js';
import * as utilities from '@/shared/moulage/utilities.js';

let backTop = new Point([1,1], {name: 'backTop', isGuide: true});
let backBottom = new Point([1,29], {name: 'backTop', isGuide: true});
let frontTop = new Point([29,1], {name: 'frontTop', isGuide: true});
let frontBottom = new Point([29,29], {name: 'frontBottom', isGuide: true});

export let initialPoints = {
  backBottom,
  backTop,
  frontBottom,
  frontTop,
};

export function setupGuide(pattern) {
  let {backBottom, backTop, frontBottom, frontTop} = initialPoints;

  pattern.addStep({
    actions: [
      utilities.getLine(backTop, backBottom, {isGuide: true, name: 'centerBack'}),
      backBottom,
      backTop,
    ],
    name: 'centerBack',
    patternPieceName: 'guide',
    instructions: 'Draw a vertical guide line 1" from the left side of the page, and at least 28" long.', // TODO: guide lines are currently arbitrary size
  });

  pattern.addStep({
    actions: [
      utilities.getLine(frontTop, frontBottom, {isGuide: true, name: 'centerFront'}),
      frontBottom,
      frontTop,
    ],
    name: 'centerFront',
    patternPieceName: 'guide',
    instructions: 'Draw a vertical guide line 1" from the right side of the page, and at least 28" long, mirroring the initial guide line.', // TODO: guide lines are currently arbitrary size
  });
}

export function drawBackDraft(pattern) {
  let {backBottom, backTop, frontBottom, frontTop} = initialPoints;

  // 3 R Across - Hip Line
  let R = utilities.getPointAlongLine(backBottom, backTop, 1, {name: 'R', patternPieceName: 'back'});
  let W = utilities.getPointAlongLine(frontBottom, frontTop, 1, {name: 'W', patternPieceName: 'front'});
  pattern.addStep({
    actions: [
      R,
      W,
      utilities.getLine(R, W, {isGuide: true, name: 'RW'}),
    ],
    patternPieceName: 'guide',
  });
  // backBodice.points.R = utilities.getPointAlongLine(backBottom, backTop, 1);
  // frontBodice.points.W = utilities.getPointAlongLine(frontBottom, frontTop, 1);
  // bodiceGuide.curves.RW = utilities.getLine(backBodice.points.R, frontBodice.points.W, constants.GUIDE_LINE);

  return;
}

export function tempDrawBackDraft(backBodice, frontBodice, bodiceGuide) {

  // 4 R to F + Square - Waist Measurement
  let waistLevel = 8 + 1/4;
  backBodice.points.F = utilities.getPointAlongLine(backBodice.points.R, backTop, waistLevel);
  frontBodice.points.J = utilities.getPointAlongLine(frontBodice.points.W, frontTop, waistLevel);
  bodiceGuide.curves.FJ = utilities.getLine(backBodice.points.F, frontBodice.points.J, constants.GUIDE_LINE);

  // 5 F to G + Square - Half Hip
  let halfHipLevel = 3 + 3/4;
  backBodice.points.G = utilities.getPointAlongLine(backBodice.points.F, backBodice.points.R, halfHipLevel);
  frontBodice.points.Y = utilities.getPointAlongLine(frontBodice.points.J, frontBodice.points.W, halfHipLevel);
  bodiceGuide.curves.GY = utilities.getLine(backBodice.points.G, frontBodice.points.Y, constants.GUIDE_LINE);

  // 6 F to A - Neck Line
  let waistToNeck = 16 + 1/4;
  backBodice.points.A = utilities.getPointAlongLine(backBodice.points.F, backTop, waistToNeck);

  // 7 F to E - Bust Level
  let bustLevel = 8;
  backBodice.points.E = utilities.getPointAlongLine(backBodice.points.F, backTop, bustLevel);
  frontBodice.points.R = utilities.getPointAlongLine(frontBodice.points.J, frontTop, bustLevel);
  bodiceGuide.curves.ER = utilities.getLine(backBodice.points.E, frontBodice.points.R, constants.GUIDE_LINE);

  // 8 E to D - Crossback Level. Halfway from E to A
  let crossbackLevel = 4 + 1/8
  backBodice.points.D = utilities.getPointAlongLine(backBodice.points.E, backTop, crossbackLevel);
  frontBodice.points.G = utilities.getPointAlongLine(frontBodice.points.R, frontTop, crossbackLevel);
  bodiceGuide.curves.DG = utilities.getLine(backBodice.points.D, frontBodice.points.G, constants.GUIDE_LINE);
  backBodice.curves.DA = utilities.getLine(backBodice.points.D, backBodice.points.A);

  // 9 A to B - Back Neckline
  let necklineBase = 3;
  backBodice.points.B = backBodice.points.A.squareRight(necklineBase);
  backBodice.curves.BA = utilities.getLine(backBodice.points.B, backBodice.points.A, constants.GUIDE_LINE);

  // 9 A to B - Back Neckline utilities.GUIDE across
  let necklineHeight = 1;
  backBodice.points.C = backBodice.points.B.squareUp(necklineHeight);

  // 10 B to C - Back Neckline utilities.GUIDE up
  backBodice.curves.BC = utilities.getLine(backBodice.points.B, backBodice.points.C, constants.GUIDE_LINE);

  // 11 A to C - Neckline curve
  backBodice.curves.AC = utilities.getEulerParallelStart(backBodice.points.A, backBodice.points.C, backBodice.points.B);

  // 12 D to W - Crossback
  let crossback = 8;
  backBodice.points.W = backBodice.points.D.squareRight(crossback);

  // 13 W to K
  backBodice.points.K = backBodice.points.W.addv(backBodice.points.E.subv(backBodice.points.D));
  backBodice.curves.WK = utilities.getLine(backBodice.points.W, backBodice.points.K, constants.GUIDE_LINE);

  // 14 W to H - Up from W
  let backNeck = 3 + 1/2;
  backBodice.points.H = backBodice.points.W.squareUp(backNeck);
  backBodice.curves.WH = utilities.getLine(backBodice.points.W, backBodice.points.H, constants.GUIDE_LINE);

  // 15 H to H'
  backBodice.points["H'"] = backBodice.points.H.squareRight(1/2);
  backBodice.points["H'"].labelDir = "N";

  // 16 C to H' - Tracing Line
  // SKIP

  // 17 C to J - Along CH'
  let shoulder = 5 + 1/2;
  backBodice.points.J = utilities.getPointAlongLine(backBodice.points.C, backBodice.points["H'"], shoulder/2);

  // 18 J to J' - Dart Width
  let shoulderDartWidth = 1/2;
  backBodice.points["J'"] = utilities.getPointAlongLine(backBodice.points.J, backBodice.points["H'"], shoulderDartWidth);

  // 19 J' to I
  backBodice.points.I = utilities.getPointAlongLine(backBodice.points["J'"], backBodice.points["H'"], shoulder/2);
  backBodice.points.I.labelDir = "NE";

  // 20 F to F' - Center Back Intake
  let centerBackIntake = 1/4;
  backBodice.points["F'"] = backBodice.points.F.squareRight(centerBackIntake);
  backBodice.points["F'"].labelDir = "E";

  // 21 D to F'
  backBodice.curves["DF'"] = utilities.getLine(backBodice.points.D, backBodice.points["F'"]);

  // 22 F to R'
  let FRPrimeLength = -6;
  backBodice.points["R'"] = backBodice.points.F.squareUp(FRPrimeLength);
  backBodice.curves["RR'"] = utilities.getLine(backBodice.points["R'"], backBodice.points.R);

  // 23 F' to R'
  backBodice.curves["F'R'"] = utilities.getLine(backBodice.points["F'"], backBodice.points["R'"]);

  // 24 F' to N - To Waist Dart
  let waist = 7 + 3/4;
  backBodice.points.N = backBodice.points["F'"].squareRight(waist/2);

  // 25 N to N' - Waist Dart
  let waistDart = 1;
  backBodice.points["N'"] = backBodice.points.N.squareRight(waistDart);
  backBodice.points["N'"].labelDir = "E";

  // 26 N to N'' - Center of Waist Dart
  backBodice.points["N''"] = backBodice.points.N.squareRight(waistDart/2);
  backBodice.points["N''"].labelDir = "N";

  // 27 N' to O - Waistline
  backBodice.points.O = backBodice.points["N'"].squareRight(waist/2);
  backBodice.points.O.labelDir = "E";
  backBodice.curves["F'N"] = utilities.getLine(backBodice.points["F'"], backBodice.points.N);
  backBodice.curves["N'O"] = utilities.getLine(backBodice.points["N'"], backBodice.points.O);

  // 28 O to I' - End of Shoulder
  let endOfShoulder = 15 + 1/2;
  backBodice.points["I'"] = utilities.getPointAlongLine(backBodice.points.O, backBodice.points.I, endOfShoulder);
  backBodice.points["I'"].labelDir = "SE";

  // 29 C to I'
  // SKIP

  // 30 C to J - Along CI'
  backBodice.points.J = utilities.getPointAlongLine(backBodice.points.C, backBodice.points["I'"], shoulder/2);
  backBodice.points.J.labelDir = "SW";
  backBodice.curves.CJ = utilities.getLine(backBodice.points.C, backBodice.points.J);

  // 31 J to J'
  backBodice.points["J'"] = utilities.getPointAlongLine(backBodice.points.J, backBodice.points["I'"], shoulderDartWidth);
  backBodice.points["J'"].labelDir = "SE";
  backBodice.curves["J'I"] = utilities.getLine(backBodice.points["J'"], backBodice.points.I);

  // 32 J' to I
  backBodice.points.I = utilities.getPointAlongLine(backBodice.points["J'"], backBodice.points["I'"], shoulder/2);
  backBodice.points.I.labelDir = "NE";

  // 29 C to I - but better
  backBodice.curves.CI = utilities.getLine(backBodice.points.C, backBodice.points.I, constants.GUIDE_LINE);

  // 33 J to N
  backBodice.curves.JN = utilities.getLine(backBodice.points.J, backBodice.points.N, constants.GUIDE_LINE);

  // 34 J to S
  let shoulderDartLength = 3 + 1/2;
  backBodice.points.S = utilities.getPointAlongLine(backBodice.points.J, backBodice.points.N, shoulderDartLength);
  backBodice.curves.JS = utilities.getLine(backBodice.points.J, backBodice.points.S);

  // 35 T - Inersection of Bust Line and JN
  backBodice.points.T = utilities.getIntersection(backBodice.points.J, backBodice.points.N, backBodice.points.E, backBodice.points.K);

  // 36 T to T' - 1" toward N
  let waistDartBustOffset = 1
  backBodice.points["T'"] = utilities.getPointAlongLine(backBodice.points.T, backBodice.points.N, waistDartBustOffset);
  backBodice.curves["T'N"] = utilities.getLine(backBodice.points["T'"], backBodice.points.N);

  // 37 J' to S - A slight curver, or straight
  backBodice.curves["SJ'"] = utilities.getLine(backBodice.points.S, backBodice.points["J'"])

  // 38 N' to T'
  backBodice.curves["N'T'"] = utilities.getLine(backBodice.points["N'"], backBodice.points["T'"])

  // 39 N'' to V
  let waistDartBottomLength = 4 + 1/2;
  backBodice.points.V = backBodice.points["N''"].squareUp(- waistDartBottomLength);

  // 40 N to V
  backBodice.curves.NV = utilities.getLine(backBodice.points.N, backBodice.points.V);

  // 41 N' to V
  backBodice.curves["N'V"] = utilities.getLine(backBodice.points["N'"], backBodice.points.V);

  // 42 G' to P
  let halfHip = 8 + 1/4;
  backBodice.points["G'"] = utilities.getIntersection(backBodice.points.G, frontBodice.points.Y, backBodice.points["F'"], backBodice.points["R'"]);
  backBodice.points["G'"].labelDir = "NE";
  let pointPPrime = utilities.getIntersection(backBodice.points.N, backBodice.points.V, backBodice.points.G, frontBodice.points.Y);
  let pointPDoublePrime = utilities.getIntersection(backBodice.points["N'"], backBodice.points.V, backBodice.points.G, frontBodice.points.Y);
  backBodice.points.P = backBodice.points["G'"].squareRight(halfHip + pointPPrime.distTo(pointPDoublePrime))

  // 43 R to Q
  let hip = 9 + 1/4;
  backBodice.points.Q = backBodice.points.R.squareRight(hip);

  // 44 O to Q'
  backBodice.curves.OQ = utilities.getEulerPerpendicularWithPointInside(
    backBodice.points.O, [backBodice.points.P, backBodice.points.Q], [backBodice.points.R, backBodice.points.Q], {isLeftHanded: true}
  );
  backBodice.points["Q'"] = backBodice.curves.OQ.points[0];
  backBodice.points["Q'"].labelDir = "E";
  backBodice.curves["RQ'"] = utilities.getLine(backBodice.points.R, backBodice.points["Q'"]);
  // TODO: G' to V', V'' to P

  // 45 E' to L
  let bust = 9 + 1/2;
  backBodice.points["E'"] = utilities.getIntersection(backBodice.points.E, backBodice.points.T, backBodice.points.D, backBodice.points["F'"]);
  backBodice.points["E'"].labelDir = "NE";
  backBodice.points.L = backBodice.points["E'"].squareRight(bust);

  // 46 L to L'
  let bustEase = 1/4;
  backBodice.points["L'"] = backBodice.points.L.squareRight(bustEase);
  backBodice.points["L'"].labelDir = "NE";
  backBodice.curves["E'L'"] = utilities.getLine(backBodice.points["E'"], backBodice.points["L'"])

  // 47 O to L
  backBodice.curves.OL = utilities.getLine(backBodice.points.O, backBodice.points.L, constants.GUIDE_LINE);

  // 48 O to M
  backBodice.points.M = utilities.getPointAlongLine(backBodice.points.O, backBodice.points.L, backBodice.points.O.distTo(backBodice.points.L)/3);
  backBodice.points.M.labelDir = "E"

  // 49 M to M'
  let mOffset = 1/4;
  backBodice.points["M'"] = backBodice.points.M.squareRight(- mOffset);

  // 50 L' to M' to O
  backBodice.curves["L'O"] = utilities.getEulerMidpoint(
    backBodice.points["L'"],
    backBodice.points["M'"],
    backBodice.points.O
  );

  // 51 K to K' - K' is 1" way from K at 45°
  backBodice.points["K'"] = utilities.getPointAlongLine(backBodice.points.K, backBodice.points.K.squareRight(1).squareUp(1), 1);

  // 52 I to K' to L'
  // 53 Fixing the curve to be the right length
  let armhole = 8 + 7/8;
  backBodice.curves["I'L'"] = utilities.getEulerOfMeasurementWithInsidePoint(
    backBodice.points["I'"],
    backBodice.points["K'"],
    backBodice.points["L'"],
    armhole
  );
  // TODO D to W'

  // 54 Grainline
  backBodice.curves.GRAIN = utilities.getLine(
    backBodice.points.E.squareRight(2).squareUp(1),
    backBodice.points.G.squareRight(2).squareUp(-1)
  );
  // TODO: Make arrows for grainline

  // 55 mitre the dart
  let mitredMidPoint = utilities.mitreDart(backBodice.points.S, backBodice.points.C, backBodice.points.J, backBodice.points["J'"]);
  backBodice.points["J''"] = mitredMidPoint;
  backBodice.points["J''"].labelDir = "N";
  backBodice.curves["JJ''"] = utilities.getLine(backBodice.points.J, mitredMidPoint);
  backBodice.curves["J'J''"] = utilities.getLine(mitredMidPoint, backBodice.points["J'"]);
}



export function drawFrontDraft(backBodice, frontBodice, isMasculine) {

  // Beginning
  frontBodice.curves.WJ = utilities.getLine(frontBodice.points.W, frontBodice.points.J);

  // 9 J to A
  let frontLength = 14 + 1/2;
  frontBodice.points.A = frontBodice.points.J.squareUp(frontLength);
  frontBodice.curves.JA = utilities.getLine(frontBodice.points.J, frontBodice.points.A);

  // 10 A to B
  let frontNeck = 2 + 3/4;
  frontBodice.points.B = frontBodice.points.A.squareRight(-frontNeck);
  frontBodice.curves.AB = utilities.getLine(frontBodice.points.A, frontBodice.points.B, constants.GUIDE_LINE);

  // 11 B to C
  let frontNeckVert = frontNeck + 1/4;
  frontBodice.points.C = frontBodice.points.B.squareUp(frontNeck);
  frontBodice.curves.BC = utilities.getLine(frontBodice.points.B, frontBodice.points.C, constants.GUIDE_LINE);

  // 12 B to D
  frontBodice.points.D = utilities.getPointAlongLine(frontBodice.points.B, frontBodice.points.C, frontNeckVert/2);

  // 13 D to E
  let frontShoulderGuide = (isMasculine) ? 7 : 6;
  frontBodice.points.E = frontBodice.points.D.squareRight(- frontShoulderGuide);
  frontBodice.curves.DE = utilities.getLine(frontBodice.points.D, frontBodice.points.E, constants.GUIDE_LINE);

  // 14 B to B'
  let neckGuideLength = 5/8;
  frontBodice.points["B'"] = frontBodice.points.B.toAngleDistance(Math.PI/4, neckGuideLength);
  frontBodice.curves["BB'"] = utilities.getLine(frontBodice.points.B, frontBodice.points["B'"], constants.GUIDE_LINE);

  // 15 C to A
  let necklineInnerGuidePoint = utilities.getPointAlongLine(frontBodice.points["B'"], frontBodice.points.B, -0.75);
  frontBodice.curves["CA"] = utilities.getEulerParallelEnd(frontBodice.points.C, frontBodice.points.A, frontBodice.points.B, {outsidePoint: frontBodice.points["B'"], insidePoint: necklineInnerGuidePoint});

  // 16 C to E
  frontBodice.curves.CE = utilities.getLine(frontBodice.points.C, frontBodice.points.E, constants.GUIDE_LINE);

  // 17 C to F
  let shoulder = 5 + 1/2;
  frontBodice.points.F = utilities.getPointAlongLine(frontBodice.points.C, frontBodice.points.E, shoulder/2);

  // 18 F to F'
  let shoulderDartWidth = (isMasculine) ? 0 : 1/2;
  frontBodice.points["F'"] = utilities.getPointAlongLine(frontBodice.points.F, frontBodice.points.E, shoulderDartWidth);
  frontBodice.points["F'"].labelDir = "W";
  if (isMasculine) {
    // TODO: do not draw points with this tag
    frontBodice.points["F'"].doNotDraw = true;
  }

  // 19 F' to E'
  frontBodice.points["E'"] = utilities.getPointAlongLine(frontBodice.points["F'"], frontBodice.points.E, shoulder/2);

  // 20 J to K
  let figureWidthCalc = 4 + 3/8;
  frontBodice.points.K = frontBodice.points.J.squareRight(- figureWidthCalc);
  frontBodice.points.K.labelDir = "N";

  // 21 K to K''
  let waistDartWidth = 1/2;
  frontBodice.points["K''"] = frontBodice.points.K.squareRight(waistDartWidth / 2);

  // 22 K' to K''
  frontBodice.points["K'"] = frontBodice.points.K.squareRight(- waistDartWidth / 2);
  frontBodice.points["K'"].labelDir = "W";

  // 23 J to O
  let waistFront = 8 + 3/4;
  frontBodice.points.O = frontBodice.points.J.squareRight(- (waistFront + waistDartWidth));

  // 24 K up
  let bustWidthCrossBackGuidPoint = frontBodice.points.K.squareUp(frontBodice.points.J.distTo(frontBodice.points.G));
  frontBodice.curves.BustVline = utilities.getLine(frontBodice.points.K, bustWidthCrossBackGuidPoint, constants.GUIDE_LINE);

  // 25 A to L
  let figureLength = 8 + 1/2;
  frontBodice.points.L = utilities.getPointAlongLineDistanceFromPoint([frontBodice.points.K, bustWidthCrossBackGuidPoint], frontBodice.points.A, figureLength);
  frontBodice.curves.AL = utilities.getLine(frontBodice.points.A, frontBodice.points.L, constants.GUIDE_LINE);

  // 26 L to R'
  frontBodice.points["R'"] = utilities.getPointOnLineClosestToPoint([frontBodice.points.A, frontBodice.points.W], frontBodice.points.L);
  frontBodice.curves["LR'"] = utilities.getLine(frontBodice.points.L, frontBodice.points["R'"], constants.GUIDE_LINE);

  // 27 L to K'
  frontBodice.curves["LK'"] = utilities.getEulerParallelStart(frontBodice.points["K'"], frontBodice.points.L, frontBodice.points["K'"].squareUp(1));

  // 28 L to K';
  frontBodice.curves["K'K''"] = utilities.getEulerParallelStart(frontBodice.points["K''"], frontBodice.points.L, frontBodice.points["K''"].squareUp(1));

  // 29 F to L
  if (!isMasculine) {
    frontBodice.curves.FL = utilities.getLine(frontBodice.points.F, frontBodice.points.L, constants.GUIDE_LINE);
  }

  // 30 F' to L
  if (!isMasculine) {
    frontBodice.curves["F'L"] = utilities.getLine(frontBodice.points["F'"], frontBodice.points.L, constants.GUIDE_LINE);
  }

  // 31 K to N
  let waistDartLength = 3 + 1/2;
  frontBodice.points.N = frontBodice.points.K.squareUp(- waistDartLength);
  frontBodice.curves.KN = utilities.getLine(frontBodice.points.K, frontBodice.points.N, constants.GUIDE_LINE);

  // 32 K' to N
  frontBodice.curves["K'N"] = utilities.getLine(frontBodice.points["K'"], frontBodice.points.N);

  // 33 K'' to N
  frontBodice.curves["K''N"] = utilities.getLine(frontBodice.points["K''"], frontBodice.points.N);

  // 34 Y to P
  let halfHip = 8 + 3/4;
  let halfHipDartGap = 0;
  if (frontBodice.points.N.y > frontBodice.points.Y.y) {
    let pointPPrime = utilities.getIntersection(frontBodice.points["K'"], frontBodice.points.N, backBodice.points.G, frontBodice.points.Y);
    let pointPDoublePrime = utilities.getIntersection(frontBodice.points["K''"], frontBodice.points.N, backBodice.points.G, frontBodice.points.Y);
    halfHipDartGap = pointPPrime.distTo(pointPDoublePrime)
  }
  frontBodice.points.P = frontBodice.points.Y.squareRight(- (halfHip + halfHipDartGap));

  // 35 W to Q
  let backHip = 9 + 3/4;
  frontBodice.points.Q = frontBodice.points.W.squareRight(- backHip);

  // 36 O to Q
  let flippedAndOriginalCurves = utilities.getFlippedEulerPerpendicularWithPointInside(
    backBodice.curves.OQ,
    frontBodice.points.O,
    [frontBodice.points.P, frontBodice.points.Q],
    [frontBodice.points.W, frontBodice.points.Q],
    {isLeftHanded: false}
  );
  frontBodice.curves.OQ = flippedAndOriginalCurves.flipped;
  frontBodice.points["Q'"] = frontBodice.curves.OQ.points[0];
  frontBodice.points["Q'"].labelDir = "W";
  frontBodice.curves["WQ'"] = utilities.getLine(frontBodice.points.W, frontBodice.points["Q'"]);

  // 36 Part 2, Fixing OQ on Back
  if (flippedAndOriginalCurves.original !== backBodice.curves.OQ) {
    backBodice.curves.OQ = flippedAndOriginalCurves.original;
    backBodice.points["Q'"] = backBodice.curves.OQ.points[0];
    backBodice.points["Q'"].labelDir = "E";
    backBodice.curves["RQ'"] = utilities.getLine(backBodice.points.R, backBodice.points["Q'"]);
  }

  // 37 Add line above side level
  // 38 R' to L to S
  let bustWidthSLinePoint, sideLevelGuidePoint;
  let sideLevelGuideOffset = 1 + 1/8;
  let sideLevelPointDistance = 10;
  let bustPointToSideLevelPointDistance = sideLevelPointDistance - frontBodice.points.L.distTo(frontBodice.points["R'"]);

  if (!isMasculine) {
    let sideLevelPoint = utilities.getIntersection(frontBodice.points.L, bustWidthCrossBackGuidPoint, frontBodice.points.R, backBodice.points.E);
    bustWidthSLinePoint = sideLevelPoint.squareUp(sideLevelGuideOffset);
    sideLevelGuidePoint = bustWidthSLinePoint.squareRight(- bustPointToSideLevelPointDistance)
    frontBodice.curves.sideLevelGuide = utilities.getLine(bustWidthSLinePoint, sideLevelGuidePoint, constants.GUIDE_LINE);
  } else {
    bustWidthSLinePoint = utilities.getIntersection(frontBodice.points.L, bustWidthCrossBackGuidPoint, frontBodice.points.R, backBodice.points.E);
    sideLevelGuidePoint = bustWidthSLinePoint.squareRight(-1);
  }

  frontBodice.points.S = utilities.getPointAlongLineDistanceFromPoint([sideLevelGuidePoint, bustWidthSLinePoint], frontBodice.points.L, bustPointToSideLevelPointDistance);
  frontBodice.curves.LS = utilities.getLine(frontBodice.points.L, frontBodice.points.S, constants.GUIDE_LINE);

  // 39 S to O
  if (!isMasculine) {
    frontBodice.curves.SO = utilities.getLine(frontBodice.points.S, frontBodice.points.O, constants.GUIDE_LINE);
  }

  // 40 R' to S'
  if (!isMasculine) {
    frontBodice.points["S'"] = utilities.getIntersection(frontBodice.points.S, frontBodice.points.O, frontBodice.points["R'"], frontBodice.points["R'"].squareRight(1));
    frontBodice.curves["LS'"] = utilities.getLine(frontBodice.points.L, frontBodice.points["S'"], constants.GUIDE_LINE);
  }

  // 41 S' to S''
  if (!isMasculine) {
    let sDoublePrimeDist = 1 + 1/8;
    frontBodice.points["S''"] = utilities.getPointAlongLine(frontBodice.points["S'"], frontBodice.points.O, sDoublePrimeDist);
  }

  // 42 S'' to L
  if (!isMasculine) {
    frontBodice.curves["S''L"] = utilities.getLine(frontBodice.points["S''"], frontBodice.points.L, constants.GUIDE_LINE);
  }

  // 43 G to I
  let crossBackGuideLength = 6 + 7/8;
  if (isMasculine) {
    frontBodice.points.I = frontBodice.points.G.squareRight(- crossBackGuideLength);
  } else {
    let cbGuidePoint = frontBodice.points.G.squareRight(- crossBackGuideLength);
    let cbDartIntF = utilities.getIntersection(cbGuidePoint, frontBodice.points.G, frontBodice.points.F, frontBodice.points.L);
    let cbDartIntFPrime = utilities.getIntersection(cbGuidePoint, frontBodice.points.G, frontBodice.points["F'"], frontBodice.points.L);
    let dartDist = cbDartIntF.distTo(cbDartIntFPrime);
    frontBodice.points.I = frontBodice.points.G.squareRight(- (crossBackGuideLength +  dartDist));
  }

  // 44 I to U
  frontBodice.points.U = utilities.getIntersection(frontBodice.points.I, frontBodice.points.I.squareUp(1), frontBodice.points.S, bustWidthSLinePoint);
  frontBodice.curves.IU = utilities.getLine(frontBodice.points.I, frontBodice.points.U, constants.GUIDE_LINE);

  // 45 L to U
  if (frontBodice.points.L.y > frontBodice.points.S.y) {
    frontBodice.curves.LU = utilities.getLine(frontBodice.points.L, frontBodice.points.U, constants.GUIDE_LINE);
  }

  // 46 E' to I to S
  frontBodice.curves["E'S_guide"] = utilities.getEulerMidpoint(frontBodice.points["E'"], frontBodice.points.I, frontBodice.points.S, {curveStyle: constants.GUIDE_LINE});

  // 47 U to T
  if (frontBodice.points.L.y > frontBodice.points.S.y) {
    // TODO: intersect line with a curve
    //       Intersect LU with E'IS to utilities.get T
  }

  // 48 T to T'
  // TODO: utilities.get point a distance along a curve
}

export function create() {
  let pattern = new Pattern();

  pattern.patternPieces.guide = new PatternPiece();
  pattern.patternPieces.back = new PatternPiece();
  pattern.patternPieces.front = new PatternPiece({
    labelColor: "#900",
    labelDefaultDir: "E",
  });

  // let backBodice = {
  //   points: {},
  //   curves: {},
  // };
  // let bodiceGuide = {
  //   curves: {},
  // };
  // let frontBodice = {
  //   points: {},
  //   curves: {},
  //   labelColor: "#900",
  //   labelDefaultDir: "E",
  // };
  setupGuide(pattern);
  drawBackDraft(pattern);
  // // console.log(performance.now() - start);
  // drawFrontDraft(backBodice, frontBodice, false);

  return pattern;
}
