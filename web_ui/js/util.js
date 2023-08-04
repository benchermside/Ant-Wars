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
 * Takes in 2 coords, returns true if coords are adjacent or equal, otherwise false.
 */
function coordAdjacent(coord1, coord2) {
    const x1 = coord1[0];
    const x2 = coord2[0];
    const y1 = coord1[1];
    const y2 = coord2[1];
    if(y1 === y2) {
        return Math.abs(x1-x2) <= 1;
    } else if(Math.abs(y2 - y1) === 1) {
        const furtherLeftX = y1 % 2 === 0 ? x1 : x2;
        const furtherRightX = y1 % 2 === 0 ? x2 : x1;
        return furtherLeftX === furtherRightX || furtherLeftX === furtherRightX + 1;
    } else {
        return false;
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
    possibleNeighbors.push([x+1, y]);
    possibleNeighbors.push([x-1 + (y%2), y-1]);
    possibleNeighbors.push([x + (y%2), y-1]);
    const neighbors = [];
    for (let i = 0; i < possibleNeighbors.length; i++) {
        let neighbor = possibleNeighbors[i];
        if(neighbor[0] >= 0 && neighbor[0] < gridLength && neighbor[1] >= 0 && neighbor[1] < gridHeight) {
            neighbors.push(neighbor);
       }
    }
    return neighbors;
}


/*
 * This is passed a seed (any 32 bit number). It will return a function of no arguments which can be called
 * repeatedly to return a series of different floats in the range from 0 (inclusive) to 1 (exclusive). For
 * the same seed, the same series of numbers will be generated.
 *
 * This is intended to be used as a repeatable pseudo-random number generator. The source code comes from
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316#47593316
 * (where it is called "mulberry32"). Some research shows that this PSRNG isn't great but it's fairly good for
 * one that has only 32 bits of seed -- and that's satisfactory for our purposes for now.
 */
function newRandomSequence(seed) {
    return function() {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

/* returns the direction an ant should be facing after moving one space from the old location to the new
location on the hex grid -- old location and new location are an array of length two where the first
value represents x and the second represents why
 */
function getNewFacing (oldLocation, newLocation){
    let facing = 12;
    if (oldLocation[1] === newLocation[1]){
        facing = (facing + 3*(newLocation[0]-oldLocation[0]))%12;
    } else {
        facing = 15 + (2*(newLocation[1]-oldLocation[1]));

        if (newLocation[1]%2 === 0 && newLocation[0] === oldLocation[0] ||
            (newLocation[1]%2 === 1 && newLocation[0] !== oldLocation[0])) {
            facing = facing -2*(oldLocation[1]-newLocation[1]);
        }
        facing = facing%12;
    }
    return facing;
}
