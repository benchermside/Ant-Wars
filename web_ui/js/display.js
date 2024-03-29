/*
 * Contains code to draw the UI of the game.
 */


/*
 * Tells what fraction of a hex width the borders are.
 */
const lineWidthFraction = 1 / 25;


/*
 * Given an x and y coordinates of a hex and the hexSize, this returns an [x,y] pair giving the
 * drawing coordinates of the center of that hex.
 */
function hexCenter(x, y, hexSize) {
    const cord = [];
    if(y % 2 === 0) {
        cord[0] = hexSize / 2 + x * hexSize;
    } else {
        cord[0] = hexSize + x * hexSize;
    }
    cord[1] = hexSize * (1 / (2 * Math.sqrt(3))) * (2 + 3 * y);
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

    // --- deal with the "zigzag" areas where the rows of hexes overlap in the same y value ---
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
 * This creates the path for a hexagon of size hexSize, centered at coord (which
 * is measured in pixels).
 */
function createHexPath(drawContext, hexSize, cord) {
    drawContext.beginPath();
    drawContext.moveTo(cord[0]              , cord[1] - hexSize / (    Math.sqrt(3)));
    drawContext.lineTo(cord[0] + hexSize / 2, cord[1] - hexSize / (2 * Math.sqrt(3)));
    drawContext.lineTo(cord[0] + hexSize / 2, cord[1] + hexSize / (2 * Math.sqrt(3)));
    drawContext.lineTo(cord[0]              , cord[1] + hexSize / (    Math.sqrt(3)));
    drawContext.lineTo(cord[0] - hexSize / 2, cord[1] + hexSize / (2 * Math.sqrt(3)));
    drawContext.lineTo(cord[0] - hexSize / 2, cord[1] - hexSize / (2 * Math.sqrt(3)));
    drawContext.lineTo(cord[0]              , cord[1] - hexSize / (    Math.sqrt(3)));
    drawContext.closePath();
}

//x1 and y1 are the center cordinates of the first hexagon.
//x2 and y2 are the center coordinates of the second, neighboring hexagon
//returns the coordinate of the center of side the hexes share
function neighboringSide(x1, y1, x2, y2) {
    const cord = [];
    cord.push(x1 + (x2 - x1) / 2);
    cord.push(y1 + (y2 - y1) / 2);
    return cord;
}

/*
 * Inputs x1, y1 gives the hex address of a hex and x2, y2 give the hex address of a neighboring hex.
 * This will return return [[dx1,dy1], [dx2,dy2]], a pair of offsets (in canvas coordinates) for the
 * two corners the hexes share. The corners will always be listed in order going clockwise around the
 * hex (x1,y1).
 */
function cornersBetweenOffsets(x1, y1, x2, y2) {
    if (y1 === y2) { // if they are in the same row...
        if (x2 === x1 + 1) { // hex2 is EAST of hex1
            return [
                [hexSize / 2, hexSize / (2 * Math.sqrt(3))],
                [hexSize / 2, -1 * hexSize / (2 * Math.sqrt(3))],
            ];
        } else if (x2 === x1 - 1) { // hex2 is WEST of hex1
            return [
                [-1 * hexSize / 2, -1 * hexSize / (2 * Math.sqrt(3))],
                [-1 * hexSize / 2, hexSize / (2 * Math.sqrt(3))],
            ];
        }
    } else if (y2 === y1 + 1) { // if hex2 is below hex1...
        if (x2 === x1 + (y1 % 2) - 1) { // hex2 is SOUTHWEST of hex1
            return [
                [0, hexSize / Math.sqrt(3)],
                [-1 * hexSize / 2, hexSize / (2 * Math.sqrt(3))],
            ];
        } else if (x2 === x1 + (y1 % 2)) { // hex2 is SOUTHEAST of hex1
            return [
                [hexSize / 2, hexSize / (2 * Math.sqrt(3))],
                [0, hexSize / Math.sqrt(3)],
            ];
        }
    } else if (y2 === y1 - 1) { // if hex2 is above hex1...
        if (x2 === x1 + (y1 % 2) - 1) { // hex2 is NORTHWEST of hex1
            return [
                [-1 * hexSize / 2, -1 * hexSize / (2 * Math.sqrt(3))],
                [0, -1 * hexSize / Math.sqrt(3)],
            ];
        } else if (x2 === x1 + (y1 % 2)) { // hex2 is NORTHEAST of hex1
            return [
                [0, -1 * hexSize / Math.sqrt(3)],
                [hexSize / 2, -1 * hexSize / (2 * Math.sqrt(3))],
            ];
        }
    }
    throw Error(`cornersBetween was passed non-neighbors: (${x1},${y1}) and (${x2},${y2})`);
}


/*
 * A list of terrain types that will grow grass if they are adjacent to the surface.
 */
const terrainsThatGrowGrass = [1, 4, 5];


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

    const colorNames = [
        "#36454f", // Bedrock
        "#734434", // Dirt
        "#808080", // Stone
        "#8bc1f7", // Sky
        "#734434", // Dirt with Tunnel
        "#734434", // Dirt with Chamber
        "#8bc1f7", // Surface
    ];

    for(let x=0;x<terrainGrid[0].length; x++) {
        for (let y = 0; y < terrainGrid.length; y++) {
            const cord = hexCenter(x, y, hexSize);
            const terrain = terrainGrid[y][x];
            // --- Draw the background ---
            createHexPath(drawContext, hexSize, cord);
            drawContext.fillStyle = colorNames[terrain];
            drawContext.fill();

            // --- Draw tunnels and chambers ---
            if ([4,5].includes(terrain)) { //is a 4(tunnel) or 5(chamber)
                drawContext.fillStyle = "#b37470";
                if(terrain === 5) {
                    drawContext.beginPath();
                    drawContext.ellipse(cord[0], cord[1], hexSize / 2.5, hexSize / 2.8, 0, 0, Math.PI * 2);
                    drawContext.fill();
                } else {
                    drawContext.beginPath();
                    drawContext.ellipse(cord[0], cord[1], hexSize / 7, hexSize / 7, 0, 0, Math.PI * 2);
                    drawContext.fill();
                }
                drawContext.beginPath();
                drawContext.strokeStyle = "#b37470";
                drawContext.lineWidth = hexSize / 8;
                const neighbors = findNeighbors(terrainGrid, x, y);
                neighbors.forEach((neighbor) => {
                    if ([4, 5, 6].includes(terrainGrid[neighbor[1]][neighbor[0]])) { //if a tunneled/chamber neighbor OR the surface
                        drawContext.moveTo(cord[0], cord[1]);
                        const neighborCenter = hexCenter(neighbor[0], neighbor[1], hexSize);
                        const sideCord = neighboringSide(cord[0], cord[1], neighborCenter[0], neighborCenter[1]);
                        drawContext.lineTo(sideCord[0], sideCord[1]);
                        // drawContext.bezierCurveTo(cord[0]+2, cord[1]+2, sideCord[0]-2, sideCord[1]-2, sideCord[0], sideCord[1]);
                        drawContext.stroke();
                    }
                });
            }

            // --- Draw the grass on Surface spaces ---
            if (terrain === 6) {
                const neighbors = findNeighbors(terrainGrid, x, y);
                neighbors.forEach((neighbor) => {
                    if (!(x === neighbor[0] && y === neighbor[1])) { // the SAME hex isn't a neighbor we want to use!
                        const neighborTerrain = terrainGrid[neighbor[1]][neighbor[0]];
                        if (terrainsThatGrowGrass.includes(neighborTerrain)) {
                            const offsetVals = cornersBetweenOffsets(x, y, neighbor[0], neighbor[1]);
                            const grassHeight = 0.3; // how tall the grass is, ranges from 0 to 1.
                            const r = 1 - grassHeight;
                            drawContext.fillStyle = "#009900";
                            drawContext.beginPath();
                            drawContext.moveTo(cord[0] + offsetVals[0][0], cord[1] + offsetVals[0][1]);
                            drawContext.lineTo(cord[0] + offsetVals[1][0], cord[1] + offsetVals[1][1]);
                            drawContext.lineTo(cord[0] + r * offsetVals[1][0], cord[1] + r * offsetVals[1][1]);
                            drawContext.lineTo(cord[0] + r * offsetVals[0][0], cord[1] + r * offsetVals[0][1]);
                            drawContext.closePath();
                            drawContext.fill();
                        }
                    }
                });
            }

            // --- Draw the hex border ---
            createHexPath(drawContext, hexSize, cord);
            drawContext.lineWidth = hexSize * lineWidthFraction;
            drawContext.strokeStyle = "black";
            drawContext.stroke();
        }
    }
}

//ctx.ellipse(100, 100, 50, 75, Math.PI / 4, 0, 2 * Math.PI);

/*
 * This is given a drawContext, the terrainGrid, the hexSize, and the coordinates of a
 * particular hex. It highlights that particular hex.
 */
function highlightHex(drawContext, hexSize, coord) {
    const pixelCoord = hexCenter(coord[0], coord[1], hexSize);
    createHexPath(drawContext, hexSize, pixelCoord);
    drawContext.lineWidth = hexSize * lineWidthFraction;
    drawContext.strokeStyle = "#FFFFFF";
    drawContext.stroke();
}

/*
 * This is given a drawContext, the terrainGrid, the hexSize, and an indicator (see dataStructures.js).
 * It draws that particular hex as indicated.
 */
function indicateHex(drawContext, hexSize, indicator) {
    const pixelCoord = hexCenter(indicator.location[0], indicator.location[1], hexSize);
    createHexPath(drawContext, hexSize * (1 - 2 * lineWidthFraction), pixelCoord);
    drawContext.lineWidth = hexSize * lineWidthFraction;
    drawContext.strokeStyle = indicator.color;
    drawContext.stroke();
}
