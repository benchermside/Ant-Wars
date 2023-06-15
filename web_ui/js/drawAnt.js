/*
 * Contains code to draw an ant.
 */



// BezierShapePoint
//
// A BezierShapePoint is one point along a shape which is drawn using bezier curves.
//
// It is an object with four fields: "x" and "y" give the coordinates of a point, "angle"
// gives the tangent to that point in "clockAngle" (0 up to 12) clockwise from "straight down".
// (We always have angle >=0 and angle < 360.) And "flat" tells how far out the control points
// should be: larger numbers will be more flat.
//
// Example:
//   const p = {x:0, y:50, angle:3, flat:5}


// LinePoint
//
// A LinePoint is one point along a lnie which is drawn using straight segments.
//
// It is an object with two fields, "x" and "y".
//
// Example:
//   const p = {x: 3, y:6}


// Shape
//
// A thing we can draw. There are two kinds right now: a solid shape with bezier
// curves or a straight line.
//
// It has a field named "type" which is either "BezierShape" or "Line". And it has
// other fields depending on the value of that:
//   BezierShape:
//     "points": a list of BezierShapePoint. The first and last point should be identical.
//
//   Line:
//     "points": A list of LinePoint.
//     "width": the width of the line
//
// Example:
//   const shape = {
//       "type": "BezierShape",
//       "points": [
//           {x:0,  y:13,  angle:3, flat:2},
//           {x:4,  y:10,  angle:5, flat:1.5},
//           {x:3,  y:8,   angle:9, flat:0.8},
//           {x:0,  y:13,  angle:3, flat:2},
//       ]
//   };


// Diagram
//
// A collection of Shapes.
//
// It is just an array of Shape objects.



/*
 * This is passed an array of pointData representing one side of a shape (the positive x side)
 * and it reflects that in the y-axis to produce (and return) the points of a complete shape.
 *
 * It requires that the first and last point have x=0 and all other points have x >= 0.
 */
function makeSymmetric(oneSide) {
    console.assert(oneSide[0].x === 0);
    console.assert(oneSide[oneSide.length - 1].x === 0);
    console.assert(oneSide.every(p => p.x >= 0));

    const result = oneSide.slice(); // copy the existing points
    const reflectedPoints = []; // all but first and last point w/ x reversed
    oneSide.slice(1,-1).forEach(p => {
        reflectedPoints.push({
            x: -1 * p.x,
            y: p.y,
            angle: (18 - p.angle) % 12, // reflect in y-axis
            flat: p.flat,
        });
    });
    reflectedPoints.reverse(); // reverse the reflected ones
    reflectedPoints.forEach(p => result.push(p)); // add them to the list
    result.push(oneSide[0]); // add the first point at the end of the list also
    return result;
}


/*
 * This is given a shape and returns an equivalent shape which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistBezierShapePoints(points, scale, clockAngle) {
    const cosAngle = Math.cos(clockAngle * Math.PI / 6);
    const sinAngle = Math.sin(clockAngle * Math.PI / 6);
    return points.map(p => {
        return {
            x: scale * (p.x * cosAngle - p.y * sinAngle),
            y: scale * (p.x * sinAngle + p.y * cosAngle),
            angle: (p.angle + clockAngle) % 12,
            flat: scale * p.flat,
        }
    });
}

/*
 * This is given a shape and returns an equivalent shape which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistLinePoints(points, scale, clockAngle) {
    const cosAngle = Math.cos(clockAngle * Math.PI / 6);
    const sinAngle = Math.sin(clockAngle * Math.PI / 6);
    return points.map(p => {
        return {
            x: scale * (p.x * cosAngle - p.y * sinAngle),
            y: scale * (p.x * sinAngle + p.y * cosAngle),
        };
    });
}

/*
 * This is given a shape and returns an equivalent shape which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistShape(shape, scale, clockAngle) {
    if (shape.type === "BezierShape") {
        return {
            type: "BezierShape",
            points: twistBezierShapePoints(shape.points, scale, clockAngle),
        };
    } else if (shape.type === "Line") {
        return {
            type: "Line",
            points: twistLinePoints(shape.points, scale, clockAngle),
            width: scale * shape.width,
        };
    } else {
        throw Error("Invalid type for shape");
    }
}

/*
 * This is given a diagram and returns an equivalent diagram which has been resized
 * and rotated. The rotate angle is measured in "clock angles" (like numbers on a clock,
 * from 0..12). The size is a multiplier, where 1 means leave it the same size.
 */
function twistDiagram(diagram, scale, clockAngle) {
    return diagram.map(shape => twistShape(shape, scale, clockAngle));
}


/*
 * Given the points of a line, this returns the points of the same line reflected over the y-axis.
 */
function reflectXLinePoints(points) {
    return points.map(p => {
        return {x: -1 * p.x, y: p.y};
    });
}

/*
 * Given a shape, this returns the same shape reflected over the y-axis. It only
 * works on lines at the moment.
 */
function reflectXShape(shape) {
    if (shape.type === "BezierShape") {
        throw Error("Not supported.");
    } else if (shape.type === "Line") {
        return {
            type: "Line",
            points: reflectXLinePoints(shape.points),
            width: shape.width,
        };
    } else {
        throw Error("Invalid type for shape");
    }
}


/*
 * This is passed a draw context, an array of BezierShapePoint objects (where the first and
 * last object are the same), and an x,y position. It draws the shape to the drawContext (in black)
 * at that location.
 */
function drawBezierShapePoints(drawContext, points, x, y) {
    console.assert(points[0].x === points[points.length - 1].x);
    console.assert(points[0].y === points[points.length - 1].y);

    function ctrlPos(p) {
        const cosAngle = Math.cos(p.angle * Math.PI / 6);
        const sinAngle = Math.sin(p.angle * Math.PI / 6);
        const dx = p.flat * -1 * sinAngle;
        const dy = p.flat * cosAngle;
        return {
            nextX: p.x + dx,
            nextY: p.y + dy,
            prevX: p.x - dx,
            prevY: p.y - dy,
        };
    }

    const cx = drawContext;
    cx.beginPath();
    cx.moveTo(x + points[0].x, y + points[0].y);
    for (let i=1; i < points.length; i++) { // loop over all EXCEPT the first and last
        const prev = points[i-1];
        const prevCtrlPos = ctrlPos(prev);
        const p = points[i];
        const thisCtrlPos = ctrlPos(p);
        cx.bezierCurveTo(
            x + prevCtrlPos.nextX, y + prevCtrlPos.nextY,
            x + thisCtrlPos.prevX, y + thisCtrlPos.prevY,
            x + p.x, y + p.y // x,y of the point
        );
    }
    cx.closePath();
    cx.fillStyle = "black";
    cx.fill();
}

/*
 * On context "drawContext", this draws the line whose points are in "points"
 * at location ("x", "y").
 */
function drawLine(drawContext, shape, x, y) {
    const cx = drawContext;
    const points = shape.points;
    cx.beginPath();
    cx.moveTo(x + points[0].x, y + points[0].y);
    for (let i=1; i < points.length; i++) {
        const p = points[i];
        cx.lineTo(x + p.x, y + p.y);
    }
    cx.lineWidth = shape.width;
    cx.stroke();
}

function drawShape(drawContext, shape, x, y) {
    if (shape.type === "BezierShape") {
        return drawBezierShapePoints(drawContext, shape.points, x, y);
    } else if (shape.type === "Line") {
        return drawLine(drawContext, shape, x, y);
    } else {
        throw Error("Invalid type for shape");
    }
}

/*
 * This is passed a draw context, a diagram (list of shapes), and an x,y position. It draws
 * the shapes to the drawContext (in black) at that location.
 */
function drawDiagram(drawContext, diagram, x, y) {
    diagram.forEach(shape => {
        drawShape(drawContext, shape, x, y)
    });
}


function drawAnt(drawContext, size, x, y) {
    const halfBodyPoints = [
        {x:0,   y:13,   angle:9,   flat:2},   // A
        {x:4,   y:10,   angle:7,   flat:1.5}, // B
        {x:3,   y:8,    angle:3,   flat:0.8}, // C
        {x:1,   y:8.2,  angle:3,   flat:0},   // D
        {x:1,   y:8.2,  angle:6,   flat:0},   // E
        {x:1,   y:7,    angle:7.5, flat:1},   // F
        {x:3,   y:6,    angle:7.5, flat:1.5}, // G
        {x:3,   y:-2,   angle:5,   flat:1.5}, // H
        {x:1.2, y:-4,   angle:4,   flat:0.5}, // I
        {x:1.2, y:-5,   angle:8,   flat:0.5}, // J
        {x:4,   y:-6,   angle:7,   flat:0.5}, // K
        {x:4.5, y:-15,  angle:5,   flat:2},   // L
        {x:0,   y:-19,  angle:3,   flat:1.5}, // M
    ];
    const body = {
        type: "BezierShape",
        points: makeSymmetric(halfBodyPoints),
    }
    const legWidth = 0.8;
    const antennaWidth = 0.5;
    const leg1 = {
        type: "Line",
        points: [
            {x:3, y:4},  // N
            {x:9,y:9},   // O
            {x:17,y:11}, // P
        ],
        width: legWidth,
    }
    const leg2 = {
        type: "Line",
        points: [
            {x:3, y:1.5}, // Q
            {x:11,y:3.5}, // R
            {x:15,y:2},   // S
            {x:19,y:3},   // T
        ],
        width: legWidth,
    }
    const leg3 = {
        type: "Line",
        points: [
            {x:2.5, y:-1}, // U
            {x:5.5, y:-3}, // V
            {x:10,y:-2.5}, // W
            {x:17,y:-8},   // X
            {x:20,y:-9},   // Y
        ],
        width: legWidth,
    }
    const antennae1 = {
        type: "Line",
        points: [
            {x: 3,   y: 11},  // AA
            {x: 12,   y: 14}, // BB
            {x: 12.5, y: 17}, // CC
            {x: 12,   y: 18}, // DD
        ],
        width: antennaWidth,
    }
    const leg4 = reflectXShape(leg1);
    const leg5 = reflectXShape(leg2);
    const leg6 = reflectXShape(leg3);
    const antennae2 = reflectXShape(antennae1);

    const unscaledAntDiagram = [body, leg1, leg2, leg3, leg4, leg5, leg6, antennae1, antennae2];
    const antDiagram = twistDiagram(unscaledAntDiagram, size/22, 7);
    drawDiagram(drawContext, antDiagram, x, y);
}
