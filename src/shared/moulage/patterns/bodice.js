import {Curve, Pattern, PatternPiece, Point} from '@/shared/moulage/classes.js';
import * as constants from '@/shared/moulage/constants.js';
import * as utilities from '@/shared/moulage/utilities.js';

let backTop = new Point([1,1], {name: 'backTop', styleName: 'guide'});
let backBottom = new Point([1,29], {name: 'backBottom', styleName: 'guide'});
let frontTop = new Point([29,1], {name: 'frontTop', styleName: 'guide'});
let frontBottom = new Point([29,29], {name: 'frontBottom', styleName: 'guide'});

export let initialPoints = {
  backBottom,
  backTop,
  frontBottom,
  frontTop,
};

export function setupGuide(pattern) {
  let {backBottom, backTop, frontBottom, frontTop} = initialPoints;
  pattern.dimensions = {
    x: {
      min: 0,
      max: 30,
    },
    y: {
      min: 0,
      max: 30,
    },
  }

  pattern.addStep({
    actions: [
      backBottom,
      backTop,
      utilities.getLine(backTop, backBottom, {styleName: 'guide', name: 'centerBack'}),
    ],
    name: 'centerBack',
    patternPieceName: 'guide',
    instructions: 'Draw a vertical guide line 1" from the left side of the page, and at least 28" long.', // TODO: guide lines are currently arbitrary size
    title: 'Draw center back guide line',
  });

  pattern.addStep({
    actions: [
      frontBottom,
      frontTop,
      utilities.getLine(frontTop, frontBottom, {styleName: 'guide', name: 'centerFront'}),
    ],
    name: 'centerFront',
    patternPieceName: 'guide',
    instructions: 'Draw a vertical guide line 1" from the right side of the page, and at least 28" long, mirroring the initial guide line.', // TODO: guide lines are currently arbitrary size
  });
}

export function drawBackDraft(pattern) {
  let {backBottom, backTop, frontBottom, frontTop} = initialPoints;
  let back = pattern.patternPieces.back;
  let front = pattern.patternPieces.front;

  // 3 R Across - Hip Line
  let R = utilities.getPointAlongLine(backBottom, backTop, 1, {name: 'R', patternPieceName: 'back'});
  let frontW = utilities.getPointAlongLine(frontBottom, frontTop, 1, {name: 'W', patternPieceName: 'front'});
  pattern.addStep({
    actions: [
      R,
      frontW,
      utilities.getLine(R, frontW, {styleName: 'guide'}),
    ],
    patternPieceName: 'guide',
  });

  // 4 R to F + Square - Waist Measurement
  let waistLevel = 8 + 1/4;
  let F = utilities.getPointAlongLine(back.points.R, backTop, waistLevel, {name: 'F', patternPieceName: 'back'});
  let frontJ = utilities.getPointAlongLine(front.points.W, frontTop, waistLevel, {name: 'J', patternPieceName: 'front'});
  pattern.addStep({
    actions: [
      F, frontJ,
      utilities.getLine(F, frontJ, {styleName: 'guide'}),
    ],
    patternPieceName: 'guide',
  });

  // 5 F to G + Square - Half Hip
  let halfHipLevel = 3 + 3/4;
  let G = utilities.getPointAlongLine(back.points.F, back.points.R, halfHipLevel, {name: 'G', patternPieceName: 'back'});
  let frontY = utilities.getPointAlongLine(front.points.J, front.points.W, halfHipLevel, {name: 'Y', patternPieceName: 'front'});
  pattern.addStep({
    actions: [
      G, frontY,
      utilities.getLine(G, frontY, {styleName: 'guide'}),
    ],
    patternPieceName: 'guide',
  });

  // 6 F to A - Neck Line
  let waistToNeck = 16 + 1/4;
  pattern.addStep({
    actions: [
      utilities.getPointAlongLine(back.points.F, backTop, waistToNeck, {name: 'A'})
    ],
    patternPieceName: 'back',
  });

  // 7 F to E - Bust Level
  let bustLevel = 8;
  let E = utilities.getPointAlongLine(back.points.F, backTop, bustLevel, {name: 'E', patternPieceName: 'back'});
  let frontR = utilities.getPointAlongLine(front.points.J, frontTop, bustLevel, {name: 'R', patternPieceName: 'front'});
  pattern.addStep({
    actions: [
      E, frontR,
      utilities.getLine(E, frontR, {styleName: 'guide'}),
    ],
    patternPieceName: 'guide',
  });

  // 8 E to D - Crossback Level. Halfway from E to A
  let crossbackLevel = 4 + 1/8
  let D = utilities.getPointAlongLine(back.points.E, backTop, crossbackLevel, {name: 'D', patternPieceName: 'back'});
  let frontG = utilities.getPointAlongLine(front.points.R, frontTop, crossbackLevel, {name: 'G', patternPieceName: 'front'});
  pattern.addStep({
    actions: [
      D, frontG,
      utilities.getLine(D, frontG, {styleName: 'guide'}),
      utilities.getLine(D, back.points.A, {patternPieceName: 'back'})
      // TODO: D might move because of the sleeve, wait to draw DA.
    ],
    patternPieceName: 'guide',
  });

  // 9 A to B - Back Neckline guide across
  let necklineBase = 3;
  let B = back.points.A.squareRight(necklineBase, {name: 'B'});
  pattern.addStep({
    actions: [
      B,
      utilities.getLine(back.points.A, B, {styleName: 'guide'}),
    ],
    patternPieceName: 'back',
  });

  // 10 B to C - Back Neckline guide up
  let necklineHeight = 1;
  let C = back.points.B.squareUp(necklineHeight, {name: 'C'});
  pattern.addStep({
    actions: [
      C,
      utilities.getLine(back.points.B, C, {styleName: 'guide'}),
    ],
    patternPieceName: 'back',
  })

  // 11 A to C - Neckline curve
  pattern.addStep({
    actions: [
      utilities.getEulerParallelStart(back.points.A, back.points.C, back.points.B),
    ],
    patternPieceName: 'back',
  })

  // 12 D to W - Crossback
  let crossback = 8;
  pattern.addStep({
    actions: [
      back.points.D.squareRight(crossback, {name: 'W'}),
    ],
    patternPieceName: 'back',
  });

  // 13 W to K
  let K = back.points.W.addv(back.points.E.subv(back.points.D), {name: 'K'});
  pattern.addStep({
    actions: [
      K,
      utilities.getLine(back.points.W, K, {styleName: 'guide'}),
    ],
    patternPieceName: 'back',
  });

  // 14 W to H - Up from W
  let backNeck = 3 + 1/2;
  let H = back.points.W.squareUp(backNeck, {name: 'H'});
  pattern.addStep({
    actions: [
      H,
      utilities.getLine(back.points.W, H, {styleName: 'guide'}),
    ],
    patternPieceName: 'back',
  });

  // 15 H to H'
  // let HPrime = ;
  pattern.addStep({
    actions: [
      back.points.H.squareRight(1/2, {name: "H'", labelDir: "N"}),
    ],
    patternPieceName: 'back',
  });

  // 16 C to H' - Tracing Line
  pattern.addStep({
    actions: [
      utilities.getLine(back.points.C, back.points["H'"], {styleName: 'temporary'}),
    ],
    patternPieceName: 'back',
  });

  // 17 C to I - Along CH'
  let shoulder = 5 + 1/2;
  let shoulderDartWidth = 1/2;
  let I = utilities.getPointAlongLine(back.points.C, back.points["H'"], shoulder + shoulderDartWidth, {name: 'I', labelDir: 'NE'});
  pattern.addStep({
    actions: [
      I,
    ],
    patternPieceName: 'back',
  });

  // 20 F to F' - Center Back Intake
  // 21 D to F'
  let centerBackIntake = 1/4;
  let FPrime = back.points.F.squareRight(centerBackIntake, {name: "F'", labelDir: "E"});
  pattern.addStep({
    actions: [
      FPrime,
      utilities.getLine(back.points.D, FPrime),
    ],
    patternPieceName: 'back',
  });

  // 22 F to R'
  // 23 F' to R'
  let FRPrimeLength = 6;
  let RPrime = back.points.F.squareUp(- FRPrimeLength, {name: "R'"});
  pattern.addStep({
    actions: [
      RPrime,
      utilities.getLine(RPrime, back.points.R),
      utilities.getLine(back.points["F'"], RPrime),
    ],
    patternPieceName: 'back',
  });

  // 24 F' to N - To Waist Dart
  // 25 N to N' - Waist Dart
  // 26 N to N'' - Center of Waist Dart
  // 27 N' to O - Waistline
  let waist = 7 + 3/4;
  let waistDart = 1;
  let N = back.points["F'"].squareRight(waist/2, {name: 'N'});
  let NPrime = N.squareRight(waistDart, {name: "N'", labelDir: 'E'});
  let NDoublePrime = N.squareRight(waistDart/2, {name: "N''", labelDir: 'N'});
  let O = NPrime.squareRight(waist/2, {name: 'O', labelDir: 'E'});
  pattern.addStep({
    actions: [
      N, NPrime, NDoublePrime, O,
      utilities.getLine(back.points["F'"], N),
      utilities.getLine(N, NPrime, {styleName: 'guide'}),
      utilities.getLine(NPrime, O),
    ],
    patternPieceName: 'back',
  });

  // 28 O to I' - End of Shoulder
  // 29 C to I'
  let endOfShoulder = 15 + 1/2;
  let IPrime = utilities.getPointAlongLine(back.points.O, back.points.I, endOfShoulder, {name: "I'", labelDir: "SE"});
  pattern.addStep({
    actions: [
      IPrime,
      utilities.getLine(back.points.C, IPrime, {styleName: 'guide'}),
    ],
    patternPieceName: 'back',
  });

  // 30 C to J - Along CI'
  // 31 J to J'
  // 32 J' to I''
  let J = utilities.getPointAlongLine(back.points.C, back.points["I'"], shoulder/2, {name: 'J', labelDir: 'SW'});
  let JPrime = utilities.getPointAlongLine(J, back.points["I'"], shoulderDartWidth, {name: "J'", labelDir: 'SE'});
  let IDoublePrime = utilities.getPointAlongLine(JPrime, back.points["I'"], shoulder/2, {name: "I''", labelDir: 'E'});
  pattern.addStep({
    actions: [
      J, JPrime, IDoublePrime,
      utilities.getLine(back.points.C, J),
      utilities.getLine(JPrime, IDoublePrime),
    ],
    patternPieceName: 'back',
  });

  // 33 J to N
  pattern.addStep({
    actions: [
      utilities.getLine(back.points.J, back.points.N, {styleName: 'guide'}),
    ],
    patternPieceName: 'back',
  });

  // 34 J to S
  // 37 J' to S - A slight curver, or straight?
  let shoulderDartLength = 3 + 1/2;
  let S = utilities.getPointAlongLine(back.points.J, back.points.N, shoulderDartLength, {name: 'S'});
  pattern.addStep({
    actions: [
      S,
      utilities.getLine(back.points.J, S),
      utilities.getLine(S, back.points["J'"]),
    ],
    patternPieceName: 'back',
  });

  // 35 T - Inersection of Bust Line and JN
  pattern.addStep({
    actions: [
      utilities.getIntersection(back.points.J, back.points.N, back.points.E, back.points.K, pattern.dimensions, {name: 'T'}),
    ],
    patternPieceName: 'back',
  });

  // 36 T to T' - 1" toward N
  // 38 N' to T'
  let waistDartBustOffset = 1
  let TPrime = utilities.getPointAlongLine(back.points.T, back.points.N, waistDartBustOffset, {name: "T'"});
  pattern.addStep({
    actions: [
      TPrime,
      utilities.getLine(TPrime, back.points.N),
      utilities.getLine(TPrime, back.points["N'"]),
    ],
    patternPieceName: 'back',
  });

  // 39 N'' to V
  // 40 N to V
  // 41 N' to V
  let waistDartBottomLength = 4 + 1/2;
  let V = back.points["N''"].squareUp(- waistDartBottomLength, {name: 'V'});
  pattern.addStep({
    actions: [
      V,
      utilities.getLine(back.points.N, V),
      utilities.getLine(back.points["N'"], V),
    ],
    patternPieceName: 'back',
  });

  // 42 G' to P
  let halfHip = 8 + 1/4;
  let GPrime = utilities.getIntersection(back.points.G, front.points.Y, back.points["F'"], back.points["R'"], pattern.dimensions, {name: "G'", labelDir: 'NE'});
  let PPrime = utilities.getIntersection(back.points.N, back.points.V, back.points.G, front.points.Y, pattern.dimensions, {name: "P'"});
  let PDoublePrime = utilities.getIntersection(back.points["N'"], back.points.V, back.points.G, front.points.Y, pattern.dimensions, {name: "P''", labelDir: 'E'});
  let P = GPrime.squareRight(halfHip + PPrime.distTo(PDoublePrime), {name: 'P'});
  pattern.addStep({
    actions: [
      GPrime, PPrime, PDoublePrime, P,
    ],
    patternPieceName: 'back',
  });

  // 43 R to Q
  let hip = 9 + 1/4;
  pattern.addStep({
    actions: [
      back.points.R.squareRight(hip, {name: 'Q'}),
    ],
    patternPieceName: 'back',
  });

  // 44 O to Q'
  let OQ = utilities.getEulerPerpendicularWithPointInside(
    back.points.O, [back.points.P, back.points.Q], [back.points.R, back.points.Q], pattern.dimensions, {isLeftHanded: true}
  );
  let QPrime = OQ.points[0];
  QPrime.labelDir = "E";
  QPrime.name = "Q'";
  OQ = new Curve(OQ);
  pattern.addStep({
    actions: [
      OQ, QPrime,
      utilities.getLine(back.points.R, QPrime),
      // TODO: Wait until adjusted with the front
    ],
    patternPieceName: 'back',
  });

  // 45 E' to L
  let bust = 9 + 1/2;
  let EPrime = utilities.getIntersection(back.points.E, back.points.T, back.points.D, back.points["F'"], pattern.dimensions, {name: "E'", labelDir: 'NE'});
  pattern.addStep({
    actions: [
      EPrime,
      EPrime.squareRight(bust, {name: 'L'}),
    ],
    patternPieceName: 'back',
  });

  // 46 L to L'
  let bustEase = 1/4;
  let LPrime = back.points.L.squareRight(bustEase, {name: "L'", labelDir: 'NE'});
  pattern.addStep({
    actions: [
      LPrime,
      utilities.getLine(back.points["E'"], LPrime),
    ],
    patternPieceName: 'back',
  });

  // 47 O to L
  pattern.addStep({
    actions: [
      utilities.getLine(back.points.O, back.points.L, {styleName: 'guide'}),
    ],
    patternPieceName: 'back',
  });

  // 48 O to M
  pattern.addStep({
    actions: [
      utilities.getPointAlongLine(back.points.O, back.points.L, back.points.O.distTo(back.points.L)/3, {name: 'M', labelDir: 'E'}),
    ],
    patternPieceName: 'back',
  });

  // 49 M to M'
  let mOffset = 1/4;
  pattern.addStep({
    actions: [
      back.points.M.squareRight(- mOffset, {name: "M'"}),
    ],
    patternPieceName: 'back',
  });

  // 50 L' to M' to O
  pattern.addStep({
    actions: [
      utilities.getEulerMidpoint(
        back.points["L'"],
        back.points["M'"],
        back.points.O
      ),
    ],
    patternPieceName: 'back',
  });

  // 51 K to K' - K' is 1" way from K at 45°
  pattern.addStep({
    actions: [
      utilities.getPointAlongLine(back.points.K, back.points.K.squareRight(1).squareUp(1), 1, {name: "K'"}),
    ],
    patternPieceName: 'back',
  });
  // TODO: Use angle to a function, as automated instructions for this one
  //       would be weird.

  // 52 I to K' to L'
  // 53 Fixing the curve to be the right length
  let armhole = 8 + 7/8;
  pattern.addStep({
    actions: [
      utilities.getEulerOfMeasurementWithInsidePoint(
        back.points["I''"],
        back.points["K'"],
        back.points["L'"],
        armhole
      ),
    ],
    patternPieceName: 'back',
  });
  // TODO D to W' for balance lines

  // 54 Grainline
  pattern.addStep({
    actions: [
      utilities.getLine(
        back.points.E.squareRight(2).squareUp(1),
        back.points.G.squareRight(2).squareUp(-1),
        {name: 'GRAIN'},
      ),
    ],
    patternPieceName: 'back',
  });
  // TODO: Make arrows for grainline

  // 55 mitre the dart
  let mitredMidPoint = utilities.mitreDart(back.points.S, back.points.C, back.points.J, back.points["J'"], pattern.dimensions, {name: "J''", labelDir: 'N'});
  pattern.addStep({
    actions: [
      mitredMidPoint,
      utilities.getLine(back.points.J, mitredMidPoint),
      utilities.getLine(mitredMidPoint, back.points["J'"]),
    ],
    patternPieceName: 'back',
  });
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
  let pattern = new Pattern({
    name:'moulage',
    title: 'Moulage',
    description: 'Making a moulage.',
  });

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
