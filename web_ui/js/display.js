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

    const colorNames = ["#36454F", "#734434", "grey", "#8bc1f7"];

    for(let x=0;x<terrainGrid[0].length; x++) {
        for(let y = 0; y<terrainGrid.length; y++) {
           const cord = hexCenter(x, y, hexSize);
            drawContext.lineWidth = hexSize/25;
            drawContext.beginPath();
            drawContext.moveTo(cord[0], cord[1]-hexSize/Math.sqrt(3));
            drawContext.lineTo(cord[0]+hexSize/2, cord[1]-hexSize/(2*Math.sqrt(3)));
            drawContext.lineTo(cord[0]+hexSize/2, cord[1]+hexSize/(2*Math.sqrt(3)));
            drawContext.lineTo(cord[0], cord[1]+hexSize/(Math.sqrt(3)));
            drawContext.lineTo(cord[0]-hexSize/2, cord[1]+hexSize/(2*Math.sqrt(3)));
            drawContext.lineTo(cord[0]-hexSize/2, cord[1]-hexSize/(2*Math.sqrt(3)));
            drawContext.lineTo(cord[0], cord[1]-hexSize/(Math.sqrt(3)));
            drawContext.closePath();
            drawContext.fillStyle = colorNames[terrainGrid[y][x]];
            drawContext.fill();
            drawContext.strokeStyle = "black";
            drawContext.stroke();
        }
    }

}
