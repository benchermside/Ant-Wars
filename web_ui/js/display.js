/*
 * Contains code to draw the UI of the game.
 */

// This is the main drawing function. It always draws to the standard game-canvas. It is
// passed the drawing context to draw on and a Grid of TerrainIds to draw.
//
// See dataStructures.js for the definition of a TerrainId and of a Grid.
//
// NOTE: The current version is a placeholder. It just draws random junk no matter what gets
//   passed in.
function drawBackground(drawContext, grid) {
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
        drawCircleAt(Math.random() * 500, Math.random() * 300);
    }
}
