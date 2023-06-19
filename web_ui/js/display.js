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
 */
function hexClicked(gameState, hexSize, pixelCoord) {
    // FIXME: There is certainly a way to simplify the code for this, but I wanted to save the first working version.
    const gridXBound = gameState.terrainGrid[0].length;
    const gridYBound = gameState.terrainGrid.length;
    const pixelX = pixelCoord[0];
    const pixelY = pixelCoord[1];
    const oneThirdHeight = hexSize / (2 * Math.sqrt(3)); // this is 1/3 the full height of a hexagon
    const thirdsY = Math.floor(pixelY / oneThirdHeight); // how many thirds down from the top this is
    const isInZigZag = thirdsY % 3 === 0; // whether this falls in the section where the points of hexes are fitting together
    let zigZagAdjust = [0,0];
    let w = "";
    if (isInZigZag) {
        const sXRaw = 2 * (pixelX % hexSize) / hexSize;
        const sYRaw = (pixelY % (2 * oneThirdHeight)) / oneThirdHeight;
        const sX = sYRaw <= 1 ? sXRaw : (sXRaw + 1) % 2;
        const sY = sYRaw % 1;
        if (sX <= 1) {
            if (sX + sY < 1) {
                zigZagAdjust = [0,-1];
            } else {
                zigZagAdjust = [0,0];
            }
        } else {
            if ((2 - sX) + sY < 1) {
                zigZagAdjust = [0,-1];
            } else {
                zigZagAdjust = [0,0];
            }
        }
    }
    const gridY = Math.floor(thirdsY / 3) + zigZagAdjust[1];
    const shiftOddRows = 0.5 * (gridY % 2); // odd numbered rows are shifted 1/2 hex to the right
    const gridX = Math.floor((pixelX / hexSize) - shiftOddRows) + zigZagAdjust[0];
    if (gridX < 0 || gridX >= gridXBound || gridY < 0 || gridY >= gridYBound) {
        return null;
    } else {
        return [gridX, gridY];
    }
}

/*
 * This function will run some tests of hexClicked(). If it doesn't throw an exception then the
 * tests all pass.
 */
function testHexClicked() {
    function assertEqualArrays(testVal, expected) {
        if (testVal === null && expected === null) {
            // success
        } else if (testVal === null || expected === null) {
            throw Error(`assertion failed: ${testVal} != ${expected}`);
        } else if (testVal.length !== expected.length || !testVal.every((x,i) => x === expected[i])) {
            throw Error(`assertion failed: ${testVal} != ${expected}`);
        } else {
            // success
        }
    }
    const gameState = {terrainGrid: [[0,0,0], [0,0,0]]};
    const hexSize = 100;
    const tests = [
        [[17,9], null],
        [[36,17], [0,0]],
        [[62,18], [0,0]],
        [[85,11], null],
        [[85,11], null],
        [[116,10], null],
        [[137,16], [1,0]],
        [[15,51], [0,0]],
        [[76,64], [0,0]],
        [[113,59], [1,0]],
        [[176,59], [1,0]],
        [[216,58], [2,0]],
        [[10,108], null],
        [[35,98], [0,0]],
        [[66,95], [0,0]],
        [[88,102], [0,1]],
        [[117,106], [0,1]],
        [[22,144], null],
    ];
    tests.forEach(data => {
        assertEqualArrays( hexClicked(gameState, hexSize, data[0]), data[1]);
    });
}
testHexClicked(); // FIXME: Run at launch


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
