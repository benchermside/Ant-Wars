/*
 * Contains code to draw the UI of the game.
 */

function hexCenter(x, y, hexSize) {
    console.log("hexSize ", hexSize);
    const cord = [];
    if(y%2 === 0) {
        cord[0] = hexSize/2 + x*hexSize;
    } else {
        cord[0] = hexSize + x*hexSize;
    }
    cord[1] = hexSize * (1/(2*Math.sqrt(3))) * (2+3*y);
    console.log(cord);
    return cord;
}




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

    drawContext.lineWidth = 10;
    drawContext.beginPath();
    drawContext.moveTo(50, 140);
    drawContext.lineTo(150, 60);
    drawContext.lineTo(250, 140);
    drawContext.closePath();
    drawContext.stroke();

    let drawCircleAt = function(x,y) {
        const colors = ["red", "green", "blue", "yellow", "orange", "purple", "brown"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const circle = new Path2D();
        circle.arc(x, y, hexSize / 3, 0, 2 * Math.PI);
        drawContext.fillStyle = color;
        drawContext.fill(circle);
    }

    // const NUM_CIRCLES = 30;
    // for (let i=0; i<NUM_CIRCLES; i++) {
    //     drawCircleAt(Math.random() * (hexSize * 8), Math.random() * (hexSize * 6));
    // }
    for(let x=0;x<5; x++) {
        for(let y = 0; y<5; y++) {
           const cord = hexCenter(x, y, hexSize);
           drawCircleAt(cord[0], cord[1]);
        }
    }

    // just stick a big ant on top of it because it's fun. This isn't really part of the logic.
    drawAnt(drawContext, hexSize, 220, 220);
}
