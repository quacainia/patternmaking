import {Curve, Pattern, PatternPiece, Point} from '@/shared/moulage/classes.js';
import * as utilities from '@/shared/moulage/utilities.js';

let backTop = new Point([1,1], {name: 'Back Top', styleName: 'guide'});
let backBottom = new Point([1,29], {name: 'Back Bottom', styleName: 'guide'});
let frontTop = new Point([29,1], {name: 'Front Top', styleName: 'guide'});
let frontBottom = new Point([29,29], {name: 'Front Bottom', styleName: 'guide'});

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

  // TODO: Auto-generate instructions for end points of initial guide lines
  backTop.instructions = 'Establish point 1 inch from both the top and left of the page.';
  backBottom = backTop.squareUp(-28, {name: 'Back Bottom'});
  pattern.addStep({
    actions: [
      backTop,
      backBottom,
      utilities.getLine(backTop, backBottom, {styleName: 'guide', name: 'centerBack'}),
    ],
    name: 'centerBack',
    patternPieceName: 'guide',
    instructions: 'Draw a vertical guide line 1" from the left side of the page, and at least 28" long.', // TODO: guide lines are currently arbitrary size
    title: 'Draw center back guide line',
  });

  frontTop.instructions = 'Establish point 1 inch from both the top and right of the page.';
  frontBottom = frontTop.squareUp(-28, {name: 'Front Bottom'});
  pattern.addStep({
    actions: [
      frontTop,
      frontBottom,
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
  // TODO - Create a squareUpToIntersection function to generate instructions
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
  // TODO: Auto-generate instructions for distance from G' to P
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
  // TODO: Auto-generate instructions for point Q'
  let OQ = utilities.getEulerPerpendicularWithPointInside(
    back.points.O, [back.points.P, back.points.Q], [back.points.R, back.points.Q], pattern.dimensions, {isLeftHanded: true, styleName: 'guide'}
  );
  let QPrime = OQ.points[0];
  QPrime.labelDir = "E";
  QPrime.name = "Q'";
  OQ = new Curve(OQ);
  pattern.addStep({
    actions: [
      OQ, QPrime,
      utilities.getLine(back.points.R, QPrime, {styleName: 'guide'}),
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
  // TODO: Auto-generate instructions for distance of M, currently weird
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
        armhole,
        {styleName: 'guide'},
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
  // TODO: Auto-generate instructions for mitring a dart.
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

export function drawFrontDraft(pattern) {
  let front = pattern.patternPieces.front;

  // Beginning
  pattern.addStep({
    actions: [
      utilities.getLine(front.points.W, front.points.J),
    ],
    patternPieceName: 'front',
  });

  // 9 J to A
  let frontLength = 14 + 1/2;
  let A = front.points.J.squareUp(frontLength, {name: 'A'});
  pattern.addStep({
    actions: [
      A,
      utilities.getLine(front.points.J, A),
    ],
    patternPieceName: 'front',
  });

  // 10 A to B
  let frontNeck = 2 + 3/4;
  let B = front.points.A.squareRight(- frontNeck, {name: 'B'});
  pattern.addStep({
    actions: [
      B,
      utilities.getLine(front.points.A, B, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 11 B to C
  let frontNeckVert = frontNeck + 1/4;
  let C = front.points.B.squareUp(frontNeckVert, {name: 'C'});
  pattern.addStep({
    actions: [
      C,
      utilities.getLine(front.points.B, C, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 12 B to D
  pattern.addStep({
    actions: [
      utilities.getPointAlongLine(front.points.B, front.points.C, frontNeckVert/2, {name: 'D'}),
    ],
    patternPieceName: 'front',
  });

  // 13 D to E
  let frontShoulderGuide = (pattern.isMasculine) ? 7 : 6;
  let E = front.points.D.squareRight(- frontShoulderGuide, {name: 'E'});
  pattern.addStep({
    actions: [
      E,
      utilities.getLine(front.points.D, E, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 14 B to B'
  let neckGuideLength = 5/8;
  let BPrime = front.points.B.toAngleDistance(Math.PI/4, neckGuideLength, {name: "B'"});
  pattern.addStep({
    actions: [
      BPrime,
      utilities.getLine(front.points.B, BPrime, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 15 C to A
  let BDoublePrime = utilities.getPointAlongLine(front.points["B'"], front.points.B, -0.75, {name: "B''"});
  pattern.addStep({
    actions: [
      BDoublePrime,
      utilities.getEulerParallelEnd(front.points.C, front.points.A, front.points.B, {outsidePoint: front.points["B'"], insidePoint: BDoublePrime}),
    ],
    patternPieceName: 'front',
  });

  // 16 C to E
  pattern.addStep({
    actions: [
      utilities.getLine(front.points.C, front.points.E, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 17 C to F
  let shoulder = 5 + 1/2;
  pattern.addStep({
    actions: [
      utilities.getPointAlongLine(front.points.C, front.points.E, shoulder/2, {name: 'F'}),
    ],
    patternPieceName: 'front',
  });

  // 18 F to F'
  let shoulderDartWidth = 1/2;
  let FPrime = utilities.getPointAlongLine(front.points.F, front.points.E, shoulderDartWidth, {name: "F'", labelDir: 'W', doNotDraw: pattern.isMasculine});
  pattern.addStep({
    actions: [
      FPrime,
    ],
    patternPieceName: 'front',
  });

  // 19 F' to E'
  pattern.addStep({
    actions: [
      utilities.getPointAlongLine(front.points["F'"], front.points.E, shoulder/2, {name: "E'"}),
    ],
    patternPieceName: 'front',
  });

  // 20 J to K
  let figureWidthCalc = 4 + 3/8;
  pattern.addStep({
    actions: [
      front.points.J.squareRight(- figureWidthCalc, {name: 'K', labelDir: 'N'}),
    ],
    patternPieceName: 'front',
  });

  // 21 K to K''
  // 22 K' to K''
  let waistDartWidth = 1/2;
  pattern.addStep({
    actions: [
      front.points.K.squareRight(waistDartWidth / 2, {name: "K''"}),
      front.points.K.squareRight(- waistDartWidth / 2, {name: "K'", labelDir: 'W'}),
    ],
    patternPieceName: 'front',
  });

  // 23 J to O
  let waistFront = 8 + 3/4;
  pattern.addStep({
    actions: [
      front.points.J.squareRight(- (waistFront + waistDartWidth), {name: 'O'}),
    ],
    patternPieceName: 'front',
  });

  // 24 K up
  let LPrime = front.points.K.squareUp(front.points.J.distTo(front.points.G), {name: "L'"});
  pattern.addStep({
    actions: [
      LPrime,
      utilities.getLine(front.points.K, LPrime, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 25 A to L
  let figureLength = 8 + 1/2;
  let L = utilities.getPointAlongLineDistanceFromPoint([front.points.K, front.points["L'"]], front.points.A, figureLength, pattern.dimensions, {name: 'L'});
  pattern.addStep({
    actions: [
      L,
      utilities.getLine(front.points.A, L, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 26 L to R'
  let RPrime = utilities.getPointOnLineClosestToPoint([front.points.A, front.points.W], front.points.L, pattern.dimensions, {name: "R'"});
  pattern.addStep({
    actions: [
      RPrime,
      utilities.getLine(front.points.L, RPrime, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 27 L to K'
  pattern.addStep({
    actions: [
      utilities.getEulerParallelStart(front.points["K'"], front.points.L, front.points["K'"].squareUp(1)),
    ],
    patternPieceName: 'front',
  });

  // 28 L to K';
  pattern.addStep({
    actions: [
      utilities.getEulerParallelStart(front.points["K''"], front.points.L, front.points["K''"].squareUp(1)),
    ],
    patternPieceName: 'front',
  });

  // 29 F to L
  // 30 F' to L
  pattern.addStep({
    actions: [
      utilities.getLine(front.points.F, front.points.L, {styleName: 'guide'}),
      utilities.getLine(front.points["F'"], front.points.L, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 31 K to N
  let waistDartLength = 3 + 1/2;
  let N = front.points.K.squareUp(- waistDartLength, {name: 'N'});
  pattern.addStep({
    actions: [
      N,
      utilities.getLine(front.points.K, N, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 32 K' to N
  // 33 K'' to N
  pattern.addStep({
    actions: [
      utilities.getLine(front.points["K'"], front.points.N),
      utilities.getLine(front.points["K''"], front.points.N),
    ],
    patternPieceName: 'front',
  });

  // 34 Y to P
  let halfHip = 8 + 3/4;
  let halfHipDartGap = 0;
  let YtoPInitialActions = [];
  if (front.points.N.y > front.points.Y.y) {
    let PPrime = utilities.getIntersection(front.points["K'"], front.points.N, front.points.Y.squareRight(- halfHip), front.points.Y, pattern.dimensions, {name: "P'"});
    let PDoublePrime = utilities.getIntersection(front.points["K''"], front.points.N, front.points.Y.squareRight(- halfHip), front.points.Y, pattern.dimensions, {name: "P''", labelDir: 'W'});
    halfHipDartGap = PPrime.distTo(PDoublePrime)
    YtoPInitialActions = [PPrime, PDoublePrime];
  }
  // TODO: Auto-generate instructions for P with intelligible distance
  pattern.addStep({
    actions: [
      ...YtoPInitialActions,
      front.points.Y.squareRight(- (halfHip + halfHipDartGap), {name: 'P'}),
    ],
    patternPieceName: 'front',
  });

  // 35 W to Q
  let backHip = 9 + 3/4;
  pattern.addStep({
    actions: [
      front.points.W.squareRight(- backHip, {name: 'Q'}),
    ],
    patternPieceName: 'front',
  });

  // 36 O to Q
  let backOQ = new Curve(Object.assign({}, pattern.patternPieces.back.curves["Q'O"]), {styleName: 'final'});
  let flippedAndOriginalCurves = utilities.getFlippedEulerPerpendicularWithPointInside(
    backOQ,
    front.points.O,
    [front.points.P, front.points.Q],
    [front.points.W, front.points.Q],
    pattern.dimensions,
    {isLeftHanded: false}
  );
  let OQ = flippedAndOriginalCurves.flipped;
  // TODO: Auto-generate instructions for point Q' 
  let QPrime = OQ.points[0];
  QPrime.labelDir = "W";
  QPrime.name = "Q'";
  OQ = new Curve(OQ);
  pattern.addStep({
    actions: [
      OQ, QPrime,
      utilities.getLine(front.points.W, QPrime),
    ],
    patternPieceName: 'front',
  });

  // 36 Part 2, Fixing OQ on Back
  let newBackOQ = flippedAndOriginalCurves.original;
  let backQPrime = newBackOQ.points[0];
  backQPrime.labelDir = 'E';
  // TODO: Auto-generate instructions for point Q' 
  if (backQPrime.approx(backOQ.points[0])) {
    backQPrime.name = "Q'";
  } else {
    backQPrime.name = "Q''";
  }
  backOQ = new Curve(newBackOQ);
  pattern.addStep({
    actions: [
      backOQ,
      backQPrime,
      utilities.getLine(pattern.patternPieces.back.points.R, backQPrime),
    ],
    patternPieceName: 'back',
  });

  // 37 Add line above side level
  // 38 R' to L to S
  let bustWidthSLinePoint, sideLevelGuidePoint;
  let sideLevelGuideOffset = 1 + 1/8;
  let sideLevelPointDistance = 10; // TODO: this is completely arbirtray
  let bustPointToSideLevelPointDistance = sideLevelPointDistance - front.points.L.distTo(front.points["R'"]);
  let sideLevelGuideActions = [];

  if (!pattern.isMasculine) {
    let sideLevelPoint = utilities.getIntersection(front.points.L, front.points["L'"], front.points.R, pattern.patternPieces.back.points.E, pattern.dimensions);
    bustWidthSLinePoint = sideLevelPoint.squareUp(sideLevelGuideOffset);
    sideLevelGuidePoint = bustWidthSLinePoint.squareRight(- bustPointToSideLevelPointDistance)
    sideLevelGuideActions.push(utilities.getLine(bustWidthSLinePoint, sideLevelGuidePoint, {styleName: 'guide', name: 'sideLevelGuide'}));
  } else {
    bustWidthSLinePoint = utilities.getIntersection(front.points.L, front.points["L'"], front.points.R, pattern.patternPieces.back.points.E, pattern.dimensions);
    sideLevelGuidePoint = bustWidthSLinePoint.squareRight(-1);
  }

  // TODO: Auto-generate instructions for front point S 
  let S = utilities.getPointAlongLineDistanceFromPoint([sideLevelGuidePoint, bustWidthSLinePoint], front.points.L, bustPointToSideLevelPointDistance, pattern.dimensions, {name: 'S'});
  pattern.addStep({
    actions: [
      ...sideLevelGuideActions,
      S,
      utilities.getLine(front.points.L, S, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 39 S to O
  if (!pattern.isMasculine) {
    pattern.addStep({
      actions: [
        utilities.getLine(front.points.S, front.points.O, {styleName: 'guide'}),
      ],
      patternPieceName: 'front',
    });
  }

  // 40 R' to S'
  // TODO: Auto-generate instructinos for S', which is squareRight to intersection
  if (!pattern.isMasculine) {
    let SPrime = utilities.getIntersection(front.points.S, front.points.O, front.points["R'"], front.points["R'"].squareRight(1), pattern.dimensions, {name: "S'"});
    pattern.addStep({
      actions: [
        SPrime,
        utilities.getLine(front.points.L, SPrime, {styleName: 'guide'}),
      ],
      patternPieceName: 'front',
    });
  }

  // 41 S' to S''
  // 42 S'' to L
  if (!pattern.isMasculine) {
    let sDoublePrimeDist = 1 + 1/8;
    let SDoublePrime = utilities.getPointAlongLine(front.points["S'"], front.points.O, sDoublePrimeDist, {name: "S''"});
    pattern.addStep({
      actions: [
        SDoublePrime,
        utilities.getLine(front.points.L, SDoublePrime, {styleName: 'guide'}),
      ],
      patternPieceName: 'front',
    });
  }

  // 43 G to I
  // TODO: Auto-generate non-confusing instructions for distance to front point I feminine
  let crossBackGuideLength = 6 + 7/8;
  if (pattern.isMasculine) {
    pattern.addStep({
      actions: [
        front.points.G.squareRight(- crossBackGuideLength, {name: 'I'}),
      ],
      patternPieceName: 'front',
    });
  } else {
    let cbGuidePoint = front.points.G.squareRight(- crossBackGuideLength);
    let cbDartIntF = utilities.getIntersection(cbGuidePoint, front.points.G, front.points.F, front.points.L, pattern.dimensions);
    let cbDartIntFPrime = utilities.getIntersection(cbGuidePoint, front.points.G, front.points["F'"], front.points.L, pattern.dimensions);
    let dartDist = cbDartIntF.distTo(cbDartIntFPrime);
    pattern.addStep({
      actions: [
        front.points.G.squareRight(- (crossBackGuideLength +  dartDist), {name: 'I'}),
      ],
      patternPieceName: 'front',
    });
  }

  // 44 I to U
  // TODO: getIntersection should accept Curve objects and read the name of the curve
  let U = utilities.getIntersection(front.points.I, front.points.I.squareUp(1), front.points.S, bustWidthSLinePoint, pattern.dimensions, {name: 'U'});
  pattern.addStep({
    actions: [
      U,
      utilities.getLine(front.points.I, U, {styleName: 'guide'}),
    ],
    patternPieceName: 'front',
  });

  // 45 L to U
  if (front.points.L.y > front.points.S.y) {
    pattern.addStep({
      actions: [
        utilities.getLine(front.points.L, front.points.U, {styleName: 'guide'}),
      ],
      patternPieceName: 'front',
    });
  }

  // 46 E' to I to S
  pattern.addStep({
    actions: [
      utilities.getEulerMidpoint(front.points["E'"], front.points.I, front.points.S, {styleName: 'guide', name: "E'S_guide"}),
    ],
    patternPieceName: 'front',
  });

  // // 47 U to T
  let deleteActions47, line;
  if (front.points.L.getAngle(front.points.U) > 2.6) {
    line = new Curve({points: [front.points.L, front.points.L.toAngleDistance(2.6, 1)], name: "a 30° line from L"});
    deleteActions47 = undefined;
  } else {
    line = front.curves.LU;
    deleteActions47 = [front.curves.LU];
  }
  let points = utilities.getPointOnCurveLineIntersection(front.curves["E'S_guide"], line, pattern.dimensions, {name: 'T'});
  let T = points[0];
  pattern.addStep({
    actions: [
      T,
      utilities.getLine(front.points.L, T, {styleName: 'guide'}),
    ],
    deleteActions: deleteActions47,
    patternPieceName: 'front',
  });

  // 48 T to T'
  let armholeDartSize = 0.5;
  let {pointAlongCurve, curveToPoint} = utilities.getPointAlongCurve(front.points.T, front.curves["E'S_guide"], armholeDartSize, {name: "T'", useReverseDirection: true});
  pattern.addStep({
    actions: [
      pointAlongCurve,
      utilities.getLine(front.points.L, pointAlongCurve, {styleName: 'guide'}),
    ],
    highlights: [
      curveToPoint,
    ],
    patternPieceName: 'front',
  });

  // 49 Cut Darts
  let cutDartsActions = [
    front.curves.FL,
    front.curves["F'L"],
    front.curves["LT'"],
  ];
  if (!pattern.isMasculine) {
    cutDartsActions.push(front.curves["LS'"]);
  }
  pattern.addStep({
    actions: utilities.cutDarts(cutDartsActions),
    patternPieceName: 'front',
  });

  // 50 Manipulate T dart into F dart
  let dartManipulationT = utilities.manipulateDart(
    front.points.L,
    [
      front.curves["LT'"],
      utilities.getLine(front.points.L, front.points.T),
    ],
    [
      front.curves["F'L"],
      front.curves.FL
    ],
    [
      front.curves["E'S_guide"],
      front.curves.CE,
      front.curves.IU, // TODO: split curves that cross a dart boundary
    ]
  )
  pattern.addStep({
    actions: [
      ...dartManipulationT.manipulated,
      ...dartManipulationT.unmanipulated,
    ],
    deleteActions: dartManipulationT.deleted,
    patternPieceName: 'front',
    instructions: "Manipulate darts to close TLT' dart into FLF' dart. Tape dart closed.",
    hideActionInstructions: true,
  });

  // 51 Manipulate S dart into F dart
  if (!pattern.isMasculine) {
    let dartManipulationT = utilities.manipulateDart(
      front.points.L,
      [
        front.curves["LS'"],
        front.curves["LS''"],
      ],
      [
        front.curves["F'L"],
        front.curves.FL
      ],
      [
        front.curves["F'E"],
        front.curves["T'E'"],
        front.curves.LT,
        front.curves.TS,
        front.curves.LS,
        front.curves.SO,
        front.curves.IU,
      ]
    )
    pattern.addStep({
      actions: [
        ...dartManipulationT.manipulated,
        ...dartManipulationT.unmanipulated,
      ],
      deleteActions: dartManipulationT.deleted,
      patternPieceName: 'front',
      instructions: "Manipulate darts to close S'LS'' dart into FLF' dart. Tape dart closed.",
      hideActionInstructions: true,
    });
  }

  // 52 Fix shoulder level
  let endOfShoulder = 15;
  let rulerCurve = utilities.getEulerPerpendicularWithPointInside(
    front.points["E'"], [front.points.O], [front.points.O, front.points.J], pattern.dimensions, {isLeftHanded: true, styleName: 'guide', maxInsidePointDist: 2}
  );
  let longRulerCurve = utilities.elongateCurve(rulerCurve, endOfShoulder);
  let pointEEE = new Point(
    longRulerCurve.points[longRulerCurve.points.length - 1],
    {name: "E''", instructions: `Establish point E'' ${endOfShoulder} inches from the waistline along the curved ruler.`}
  );

  pattern.addStep({
    actions: [
      pointEEE,
    ],
    highlights: [
      longRulerCurve,
    ],
    instructions: "Curve a flexible ruler from the waistline through point E'.",
    patternPieceName: 'front',
  });

  // 53 Fix shoulder length
  let dartAngle = front.points.L.getAngle(front.points.F) - front.points.L.getAngle(front.points["F'"]);
  let rotatedEEE = pointEEE.rotate(front.points.L, dartAngle, {name: "E''°", styleName: 'temporary'});
  let rotatedShoulder = front.curves["F'E"].rotate(dartAngle, {origin: front.points.L})
  let rotatedDart = front.curves["F'L"].rotate(dartAngle, {origin: front.points.L});
  let rotatedArmholeTop = front.curves["T'E'"].rotate(dartAngle, {origin: front.points.L})
  let rotatedArmholeBottom = front.curves.TS.rotate(dartAngle, {origin: front.points.L})
  let rotatedPointEStar = utilities.getPointAlongLine(front.points.C, rotatedEEE, shoulder, {name: 'E*', labelDir: 'N'})
  let pointFStar = utilities.getIntersectionLines(front.curves.FL, utilities.getLine(front.points.C, rotatedPointEStar), pattern.dimensions, {name: "F*"});
  let dottedLine = utilities.getLine(
    front.points.F,
    utilities.getPointAlongLine(
      front.points.L,
      front.points.F,
      front.points.L.distTo(front.points.F) + 3,
    ),
    {name: 'dartDottedLine', styleName: 'temporary'},
  )
  let fStarEStar = utilities.getLine(pointFStar, rotatedPointEStar);
  let curveCEStar = utilities.getLine(front.points.C, rotatedPointEStar);
  pattern.addStep({
    actions: [
      curveCEStar,
      rotatedPointEStar,
      pointFStar,
    ],
    highlights: [
      rotatedEEE,
      rotatedShoulder,
      rotatedDart,
      rotatedArmholeTop,
      rotatedArmholeBottom,
      dottedLine,
    ],
    hide: [
      front.points.E,
      front.points["E'"],
      front.points["E''"],
      front.points["F'"],
      front.points["T'"],
      front.points.I,
      front.points.U,
      front.points.T,
      front.points.S,
      front.curves["T'E'"],
      front.curves.TS,
      front.curves.LT,
      front.curves.IU,
      front.curves["F'L"],
      front.curves["F'E"],
      front.curves.LS,
    ],
    patternPieceName: 'front',
    instructions: "Pinch shoulder dart together just for this step.",
  });

  // 53 Cont.
  let fDoublePrime = pointFStar.rotate(front.points.L, - dartAngle, {name: "F''", labelDir: 'N', instructions: "Establish F'' at the intersection of L-F' and the new shoulder line."});
  let fDoublePrimeEStar = fStarEStar.rotate(- dartAngle, {origin: front.points.L, name: "F''E*", hideInstructions: true})
  pattern.addStep({
    actions: [
      rotatedPointEStar.rotate(front.points.L, - dartAngle, {name: "E*", labelDir: 'NW', hideInstructions: true}),
      utilities.getLine(front.points.C, front.points["F*"], {hideInstructions: true}),
      fDoublePrime,
      fDoublePrimeEStar,
      utilities.getLine(front.points.L, fDoublePrime),
      utilities.getLine(front.points.L, front.points["F*"]),
    ],
    deleteActions: [
      curveCEStar,
      front.curves.FL,
      front.curves["F'L"],
    ],
    patternPieceName: 'front',
    instructions: "Reopen the shoulder dart and lay the paper flat."
  });

  // 56 Mitre shoulder dart
  let mitredMidPoint = utilities.mitreDart(front.points.L, front.points.C, front.points["F*"], front.points["F''"], pattern.dimensions, {name: "F**", labelDir: 'N'});
  pattern.addStep({
    actions: [
      mitredMidPoint,
      utilities.getLine(front.points["F*"], mitredMidPoint),
      utilities.getLine(mitredMidPoint, front.points["F''"]),
    ],
    patternPieceName: 'front',
  });

  // 54 Side Curve
  let sideCurveCalc = utilities.copyCurve(
    pattern.patternPieces.back.curves["L'O"],
    front.points.O,
    front.points.S,
    {reverse: true, flip: true},
    {name: 'S**', labelDir: 'W'},
  );
  pattern.addStep({
    actions: [
      pattern.patternPieces.back.curves["L'O"].reverse(),
      sideCurveCalc.curve,
      sideCurveCalc.endPoint,
    ],
    patternPieceName: 'front',
  });
}

export function create() {
  let pattern = new Pattern({
    name:'moulage',
    title: 'Moulage',
    description: 'This is the moulage you will be making! Don\'t worry that it looks complicated, we\'ll walk you through it step by step. Note: The draft measurements are currently static and the draft is incomplete.',
    isMasculine: false,
  });

  pattern.patternPieces.guide = new PatternPiece();
  pattern.patternPieces.back = new PatternPiece();
  pattern.patternPieces.front = new PatternPiece({
    labelColor: "#900",
    labelDefaultDir: "E",
  });

  setupGuide(pattern);
  drawBackDraft(pattern);
  drawFrontDraft(pattern);

  return pattern;
}
