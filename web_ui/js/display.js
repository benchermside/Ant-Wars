/*
 * Contains code to draw the UI of the game.
 */

// This is the main drawing function. It always draws to the standard game-canvas. It is
// passed the drawing context to draw on, a Grid of TerrainIds to draw, and a size field
// which gives the number of pixels wide each hex should be.
//
//
// Parameters:
//  * drawContext - this is the "context" to draw onto. It is obtained by calling
//       getContext("2d") on a canvas element. The capabilities are described in
//       https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
//  * grid - this is a TerrainGrid as described in dataStructures.js
//  * hexSize - this is a number which gives the width that each hex should be (the
//       height can be calculated from the width). Each time the function is called
//       this might be different if the user has zoomed.
//
// NOTE: The current version is a placeholder. It just draws random junk no matter what gets
//   passed in.
function drawBackground(drawContext, terrainGrid, hexSize) {
    let drawCircleAt = function(x,y) {
        const colors = ["red", "green", "blue", "yellow", "orange", "purple", "brown"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const circle = new Path2D();
        circle.arc(x, y, hexSize / 3, 0, 2 * Math.PI);
        drawContext.fillStyle = color;
        drawContext.fill(circle);
    }

    const NUM_CIRCLES = 30;
    for (let i=0; i<NUM_CIRCLES; i++) {
        drawCircleAt(Math.random() * (hexSize * 8), Math.random() * (hexSize * 6));
    }
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
    /* Given one side of the point data, reflects it in the y-axis. */
    function reflect(pointData) {
        const result = pointData.slice(); // copy the existing points
        const reflectedPoints = []; // all but first and last point w/ x reversed
        pointData.slice(1,-1).forEach(p => {
            reflectedPoints.push({
                x: -1 * p.x,
                y: p.y,
                angle: (180 + 360 - p.angle) % 360, // reflect in y-axis
                flat: p.flat,
            });
        });
        reflectedPoints.reverse(); // reverse the reflected ones
        reflectedPoints.forEach(p => result.push(p)); // add them to the list
        result.push(pointData[0]); // add the first point at the end of the list also
        return result;
    }

    const points = reflect(pointData);
    const startPoint = points[0];
    console.log("points", points);

    // validate the points (this can be removed after this function is reliable)
    points.forEach(p=>{
        console.assert(p.angle >= 0 && p.angle < 360);
    });
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
    cx.moveTo(x + startPoint.x, y + startPoint.y);
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
