/*
 * Some essential utilities.
 */


/*
 * This is passed two different arrays of 2 numbers, or either of them can be null instead.
 * It returns true if the two arrays are equal (considering their values, not their identity)
 * or if both are null. If the arrays aren't of length 2 it will throw an exception.
 */
function coordEqual(coord1, coord2) {
    if (coord1 === null && coord2 === null) {
        return true;
    } else if (coord1 === null || coord2 === null) {
        return false;
    } else {
        // must be 2 arrays
        if (coord1.length !== 2 || coord2.length !== 2) {
            throw Error(`Coordinate not of length 2, comparing ${JSON.stringify(coord1)} to ${JSON.stringify(coord2)}`);

        }
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    }
}

/*
 * This is passed a terrainGrid (just to find the size of it) and x and y coordinates
 * of a hex. It returns a list of [x,y] pairs of the hexes that are adjacent to the
 * given location.
 */
function findNeighbors(terrainGrid, x, y) {
    const possibleNeighbors = [];
    const gridHeight = terrainGrid.length;
    const gridLength = terrainGrid[0].length;
    possibleNeighbors.push([x-1 + (y%2), y+1]);
    possibleNeighbors.push([x + (y%2), y+1]);
    possibleNeighbors.push([x-1, y]);
    possibleNeighbors.push([x, y]);
    possibleNeighbors.push([x+1, y]);
    possibleNeighbors.push([x-1 + (y%2), y-1]);
    possibleNeighbors.push([x + (y%2), y-1]);
    const neighbors = [];
    for (let i = 0; i < possibleNeighbors.length; i++) {
        if(possibleNeighbors[i][0] >= 0 && possibleNeighbors[i][0] < gridLength && possibleNeighbors[i][1] >= 0 && possibleNeighbors[i][1] < gridHeight){
            neighbors.push(possibleNeighbors[i]);
       }
    }
    return neighbors;
}



