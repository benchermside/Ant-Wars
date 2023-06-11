/*
 * Contains code to draw an ant.
 */



// BezierShapePoint
//
// A BezierShapePoint is one point along a shape which is drawn using bezier curves.
//
// It is an object with four fields: "x" and "y" give the coordinates of a point, "angle"
// gives the tangent to that point in degrees clockwise from "straight up". (We always
// have angle >=0 and angle < 360.) And "flat" tells how far out the control points
// should be -- larger numbers will be more flat.
//
// Example:
//   const p = {x:0, y:50, angle:90, flat:5}


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
//
// Example:
//   const shape = {
//       "type": "BezierShape",
//       "points": [
//           {x:0,   y:13,   angle:90,  flat:2},
//           {x:4,   y:10,   angle:150, flat:1.5},
//           {x:3,   y:8,    angle:270, flat:0.8},
//           {x:0,   y:13,   angle:90,  flat:2},
//       ]
//   };


// Group
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
            angle: (180 + 360 - p.angle) % 360, // reflect in y-axis
            flat: p.flat,
        });
    });
    reflectedPoints.reverse(); // reverse the reflected ones
    reflectedPoints.forEach(p => result.push(p)); // add them to the list
    result.push(oneSide[0]); // add the first point at the end of the list also
    return result;
}

/*
 * Given a list of BezierShapePoints, this scales it up by some size.
 */
function scaleBezierShapePoints(points, scale) {
    return points.map(p => {
        return {
            x: scale * p.x,
            y: scale * p.y,
            angle: p.angle,
            flat: scale * p.flat,
        }
    });
}

function scaleLinePoints(points, scale) {
    return points.map(p => {
        return {
            x: scale * p.x,
            y: scale * p.y,
        }
    })
}

function scaleShape(shape, scale) {
    if (shape.type === "BezierShape") {
        return {
            type: "BezierShape",
            points: scaleBezierShapePoints(shape.points, scale),
        };
    } else if (shape.type === "Line") {
        return {
            type: "Line",
            points: scaleLinePoints(shape.points, scale),
        };
    } else {
        throw Error("Invalid type for shape");
    }
}

function scaleGroup(group, scale) {
    return group.map(shape => scaleShape(shape, scale));
}


/*
 * Given the points of a BezierShape, this returns the points of the same shape flipped
 * over the x-axis.
 */
function flipYBezierShapePoints(points) {
    return points.map(p => {
        return {
            x: p.x,
            y: -1 * p.y,
            angle: (360 + 180 - p.angle) % 360,
            flat: p.flat,
        }
    });
}

/*
 * Given the points of a Line, this returns the points of the same line flipped
 * over the x-axis.
 */
function flipYLinePoints(points) {
    return points.map(p => {
        return {x: p.x, y: -1 * p.y}
    });
}

/*
 * Given a Shape, this returns an equivalent shape flipped
 * over the x-axis.
 */
function flipYShape(shape) {
    if (shape.type === "BezierShape") {
        return {
            type: "BezierShape",
            points: flipYBezierShapePoints(shape.points),
        };
    } else if (shape.type === "Line") {
        return {
            type: "Line",
            points: flipYLinePoints(shape.points),
        };
    } else {
        throw Error("Invalid type for shape");
    }
}

/*
 * Given a group of shapes, this returns the same group flipped over the x-axis.
 */
function flipYGroup(group) {
    return group.map(flipYShape);
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
    console.assert(points[0].angle === 90);
    console.assert(points[0].x === 0);
    console.assert(points[0].y === points[points.length - 1].y);

    function ctrlPos(point) {
        const dx = point.flat * Math.sin(point.angle * Math.PI / 180);
        const dy = point.flat * Math.cos(point.angle * Math.PI / 180);
        return {
            nextX: point.x + dx,
            nextY: point.y + dy,
            prevX: point.x - dx,
            prevY: point.y - dy,
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
function drawLinePoints(drawContext, points, x, y) {
    const cx = drawContext;
    cx.beginPath();
    cx.moveTo(x + points[0].x, y + points[0].y);
    for (let i=1; i < points.length; i++) {
        const p = points[i];
        cx.lineTo(x + p.x, y + p.y);
    }
    cx.lineWidth = 4;
    cx.stroke();
}

function drawShape(drawContext, shape, x, y) {
    if (shape.type === "BezierShape") {
        return drawBezierShapePoints(drawContext, shape.points, x, y);
    } else if (shape.type === "Line") {
        return drawLinePoints(drawContext, shape.points, x, y);
    } else {
        throw Error("Invalid type for shape");
    }
}

/*
 * This is passed a draw context, a group (list of shapes), and an x,y position. It draws
 * the shapes to the drawContext (in black) at that location.
 */
function drawGroup(drawContext, group, x, y) {
    group.forEach(shape => {
        drawShape(drawContext, shape, x, y)
    });
}


function drawAnt(drawContext, size, x, y) {
    const halfBodyPoints = [
        {x:0,   y:13,   angle:90,  flat:2},   // A
        {x:4,   y:10,   angle:150, flat:1.5}, // B
        {x:3,   y:8,    angle:270, flat:0.8}, // C
        {x:1,   y:8.2,  angle:280, flat:0.1}, // D
        {x:1,   y:8.2,  angle:185, flat:0.1}, // E
        {x:1,   y:7,    angle:135, flat:1},   // F
        {x:3,   y:6,    angle:135, flat:1.5}, // G
        {x:3,   y:-2,   angle:210, flat:1.5}, // H
        {x:1.2, y:-4,   angle:240, flat:0.5}, // I
        {x:1.2, y:-5,   angle:120, flat:0.5}, // J
        {x:4,   y:-6,   angle:150, flat:0.5}, // K
        {x:4.5, y:-15,  angle:210, flat:2},   // L
        {x:0,   y:-19,  angle:270, flat:1.5}, // M
    ];
    const body = {
        type: "BezierShape",
        points: makeSymmetric(halfBodyPoints),
    }
    const leg1 = {
        type: "Line",
        points: [
            {x:3, y:4},  // N
            {x:9,y:9},   // O
            {x:17,y:11}, // P
        ],
    }
    const leg2 = {
        type: "Line",
        points: [
            {x:3, y:1.5}, // Q
            {x:11,y:3.5}, // R
            {x:15,y:2},   // S
            {x:19,y:3},   // T
        ],
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
    }
    const antennae1 = {
        type: "Line",
        points: [
            {x: 3, y: 11}, // AA
            {x: 12, y: 14}, // BB
            {x: 12.5, y: 17}, // CC
            {x: 12, y: 18}, // DD
        ],
    }
    const leg4 = reflectXShape(leg1);
    const leg5 = reflectXShape(leg2);
    const leg6 = reflectXShape(leg3);
    const antennae2 = reflectXShape(antennae1);

    const unscaledAntGroup = [body, leg1, leg2, leg3, leg4, leg5, leg6, antennae1, antennae2];
    const antGroup = scaleGroup(flipYGroup(unscaledAntGroup), size/22);
    drawGroup(drawContext, antGroup, x, y);
}
