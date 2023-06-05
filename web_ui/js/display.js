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
//  * size - this is a number which gives the width that each hex should be (the
//       height can be calculated from the width). Each time the function is called
//       this might be different if the user has zoomed.
//
// NOTE: The current version is a placeholder. It just draws random junk no matter what gets
//   passed in.
function drawBackground(drawContext, terrainGrid, size) {
    let drawCircleAt = function(x,y) {
        const colors = ["red", "green", "blue", "yellow", "orange", "purple", "brown"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const circle = new Path2D();
        circle.arc(x, y, 25, 0, 2 * Math.PI);
        drawContext.fillStyle = color;
        drawContext.fill(circle);
    }

    const NUM_CIRCLES = 30;
    for (let i=0; i<NUM_CIRCLES; i++) {
        drawCircleAt(Math.random() * (size * 8), Math.random() * (size * 6));
    }
}
