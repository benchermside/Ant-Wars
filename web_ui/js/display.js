/*
 * Contains code to draw the UI of the game.
 */

function hexCenter(x, y, hexSize) {
    const cord = [];
    if(y%2 === 0) {
        cord[0] = hexSize/2 + x*hexSize;
    } else {
        cord[0] = hexSize + x*hexSize;
    }
    cord[1] = hexSize * (1/(2*Math.sqrt(3))) * (2+3*y);
    return cord;
}


/*
 * This is passed a specific point on the board in the form of pixelCoord, an [x,y] pair of the
 * pixel-coordinates of a location. It returns an [x,y] pair giving the grid coordinates of the
 * hexagon clicked on OR return null if the click was outside of any grid hexagon. It is ALSO
 * passed the gameState, but that is ONLY so it can find the dimensions of the grid.
 *
 * NOTE: There are probably still some ways to simplify the formula in this code, and maybe also
 * ways to make it more readable.
 */
function hexClicked(gameState, hexSize, pixelCoord) {
    // --- grab some obvious numbers we'll need ---
    const gridXBound = gameState.terrainGrid[0].length;
    const gridYBound = gameState.terrainGrid.length;
    const pixelX = pixelCoord[0];
    const pixelY = pixelCoord[1];
    const oneThirdHeight = hexSize / (2 * Math.sqrt(3)); // this is 1/3 the full height of a hexagon
    const thirdsY = Math.floor(pixelY / oneThirdHeight); // how many thirds down from the top this is (floored to integer)

    // --- deal with the "zig zag" areas where the rows of hexes overlap in the same y value ---
    const halvesX = (2 * pixelX / hexSize) % 2; // number of half-hexes from the left-side, mod 2
    const sYRaw = (pixelY % (2 * oneThirdHeight)) / oneThirdHeight;
    const sX = sYRaw <= 1 ? halvesX : (halvesX + 1) % 2;
    const sY = sYRaw % 1;
    const isInZigZag = thirdsY % 3 === 0; // whether this falls in the section where the points of hexes are fitting together
    const zigZagAdjustY = (isInZigZag && (1 - Math.abs(sX - 1) + sY < 1)) ? -1 : 0;

    // --- find the grid X and Y values ---
    const gridY = Math.floor(thirdsY / 3) + zigZagAdjustY;
    const shiftOddRows = 0.5 * (gridY % 2); // odd numbered rows are shifted 1/2 hex to the right
    const gridX = Math.floor((pixelX / hexSize) - shiftOddRows);
    if (gridX < 0 || gridX >= gridXBound || gridY < 0 || gridY >= gridYBound) {
        return null;
    } else {
        return [gridX, gridY];
    }
}


/*
 * This creates the path for a hexagon of size hexSize, centered at coord.
 */
function createHexPath(drawContext, hexSize, cord) {
    drawContext.beginPath();
    drawContext.moveTo(cord[0], cord[1]-hexSize/Math.sqrt(3));
    drawContext.lineTo(cord[0]+hexSize/2, cord[1]-hexSize/(2*Math.sqrt(3)));
    drawContext.lineTo(cord[0]+hexSize/2, cord[1]+hexSize/(2*Math.sqrt(3)));
    drawContext.lineTo(cord[0], cord[1]+hexSize/(Math.sqrt(3)));
    drawContext.lineTo(cord[0]-hexSize/2, cord[1]+hexSize/(2*Math.sqrt(3)));
    drawContext.lineTo(cord[0]-hexSize/2, cord[1]-hexSize/(2*Math.sqrt(3)));
    drawContext.lineTo(cord[0], cord[1]-hexSize/(Math.sqrt(3)));
    drawContext.closePath();
}




function findNeighbors(terrainGrid, y, x){
    const possibleNeighbors = [];
    possibleMoves.add([x-1 + (y%2), y+1]);
    possibleMoves.add([x + (y%2), y+1]);
    possibleMoves.add([x-1, y]);
    possibleMoves.add([x, y]);
    possibleMoves.add([x+1, y]);
    possibleMoves.add([x-1 + (y%2), y-1]);
    possibleMoves.add([x + (y%2), y-1]);
    const neighbors = [];
    for (let i = 0; i < possibleNeighbors.length; i++) {
        if(neighbor[0] >= 0 && neighbor[0] < gridLength && neighbor[1] >= 0 && neighbor[1] < gridHeight){
            neighbors.add(neighbors);
       }
    }
        possibleNeighbors.filter(neighbor => {
    if(neighbor[0] >= 0 && neighbor[0] < gridLength && neighbor[1] >= 0 && neighbor[1] < gridHeight){


    }
    }
}

    // if(move[0] >= 0 && move[0] < gridLength && move[1] >= 0 && move[1] < gridHeight){
    //     var currPos = gameState.terrainGrid[move[1]][move[0]];
    //     if(!notMovable.has(currPos)){ //if the space type is NOT a type you cannot move thorugh
    //         return true;
    //     }
    // }


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

function drawBackground(drawContext, terrainGrid, hexSize) {

    const colorNames = ["#36454F", "#734434", "grey", "#8bc1f7", "#734434"];

    for(let x=0;x<terrainGrid[0].length; x++) {
        for(let y = 0; y<terrainGrid.length; y++) {
           const cord = hexCenter(x, y, hexSize);
            drawContext.lineWidth = hexSize/25;
            createHexPath(drawContext, hexSize, cord);
            drawContext.fillStyle = colorNames[terrainGrid[y][x]];
            drawContext.fill();
            drawContext.strokeStyle = "black";
            drawContext.stroke();
            if(terrainGrid[y][x] === 4) {
                const neighbors = findNeighbors(terrainGrid, y, x)
            }
        }
    }
}


/*
 * This is given a drawContext, the terrainGrid, the hexSize, and the coordinates of a
 * particular hex. It highlights that particular hex.
 */
function highlightHex(drawContext, hexSize, coord) {
    const pixelCoord = hexCenter(coord[0], coord[1], hexSize);
    createHexPath(drawContext, hexSize, pixelCoord);
    drawContext.lineWidth = hexSize/25;
    drawContext.strokeStyle = "#FFFFFF";
    drawContext.stroke()
}
