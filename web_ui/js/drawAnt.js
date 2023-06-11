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
 * This is passed a draw context, an array of BezierShapePoint objects (where the first and
 * last object are the same), and an x,y position. It draws the shape to the drawContext (in black)
 * at that location.
 */
function drawBezierShape(drawContext, shape, x, y) {
    console.assert(shape[0] === shape[shape.length - 1]);

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
    const startPoint = shape[0];

    const cx = drawContext;
    cx.beginPath();
    cx.moveTo(x + startPoint.x, y + startPoint.y);
    for (let i=1; i < shape.length; i++) { // loop over all EXCEPT the first and last
        const prev = shape[i-1];
        const prevCtrlPos = ctrlPos(prev);
        const p = shape[i];
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
 * Still under development. This draws the head of an ant (facing south), centered at x,y.
 */
function drawAntHead(drawContext, x, y) {
    const pointData = [
        {x:0, y:50, angle:90, flat:5},
        {x:40, y:30, angle:155, flat: 20},
        {x:40, y:-30, angle:250, flat: 20},
        {x:0, y:-25, angle:270, flat:25},
    ];

    const points = makeSymmetric(pointData);

    drawBezierShape(drawContext, points, x, y);
}
