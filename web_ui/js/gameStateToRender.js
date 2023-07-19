

/*
Given an array of antStates, Returns an array of indexes into that array that indicate the
ants at the specified coord.  If beginIndex is given returns ants from that index to the end of the
array.  If it is not specified returns all ants at that coord.
 */
function getAntNumsAt(ants, coord, beginIndex){
    if (beginIndex===undefined){
        beginIndex = 0;
    }

    const antsAt = [];
    for (let i = beginIndex; i < ants.length; i++) {
        if (coordEqual(ants[i].location, coord)){
            antsAt.push(i);
        }
    }
    return antsAt;
}

/*
Given an array of antStates, Returns an array of antStates that indicate the
ants at the specified coord.  If beginIndex is given returns ants from that index to the end of the
array.  If it is not specified returns all ants at that coord.
 */
function getAntStatesAt(ants, coord, beginIndex){
    if (beginIndex===undefined){
        beginIndex = 0;
    }

    const antsAt = [];
    for (let i = beginIndex; i < ants.length; i++) {
        if (coordEqual(ants[i].location, coord)){
            antsAt.push(ants[i]);
        }
    }
    return antsAt;
}


/*
 * This is given a GameState and a location, and it returns a (possibly empty) array of
 * [colonyNum, antNum] pairs specifying any ants that are at the given location.
 */
function getAllAntNumsAt(gameState, coord) {
    const result = [];
    gameState.colonies.forEach((colony, colonyNumber) => {
        colony.ants.forEach((ant, antNumber) => {
            if (coordEqual(ant.location, coord)) {
                result.push( [colonyNumber, antNumber]);
            }
        });
    });
    return result;
}



/*
Given an array of eggStacks, Returns the eggStack at the specified coord.  If beginIndex is given returns egg from that index to the end of the
array.  If it is not specified returns all eggs at that coord.
 */
function getEggAt(eggs, coord, beginIndex){
    if (beginIndex===undefined){
        beginIndex = 0;
    }

    const eggAt = {};
    for (let i = beginIndex; i < eggs.length; i++) {
        if (coordEqual(eggs[i].location, coord)){
            return eggs[i];
        }
    }
    return null;
}

/*
 * Given an array of antStates some of which may be at the same location, returns a new array of new antStates
 * in which the ants at the same location are merged into one ant stack (antState). Also removes ant stacks
 * with zero ants in them.
 */
function mergeAnts(ants){
    const mergedAnts = [];
    const merged = ants.map(ant=>false); // track any ants that have already been merged in

    ants.forEach((ant, antNumber) => {
        if (!merged[antNumber]){
            // Make a copy of the existing ant
            const newAnt = {};
            newAnt.cast = ant.cast;
            newAnt.facing = ant.facing;
            newAnt.location = [ant.location[0], ant.location[1]]; // clone the location
            newAnt.numberOfAnts = ant.numberOfAnts;
            newAnt.foodHeld = ant.foodHeld;

            // Now merge in any OTHER (higher numbered) ants that are of the same cast and location
            const antNumsAt = getAntNumsAt(ants, ant.location, antNumber + 1);
            antNumsAt.forEach(otherAntNumber => {
                const otherAnt = ants[otherAntNumber];
                if (otherAnt.cast === ant.cast) {
                    merged[otherAntNumber] = true; // mark it as merged; we will skip it when we get to it
                    newAnt.numberOfAnts = newAnt.numberOfAnts + otherAnt.numberOfAnts;
                    newAnt.foodHeld = newAnt.foodHeld + otherAnt.foodHeld;
                    console.log("AAA Merged in ant ", JSON.stringify(otherAnt), " giving ", JSON.stringify(newAnt)); // FIXME: Remove
                }
            });

            // As long as it isn't 0 ants, push it onto the new list
            if (newAnt.numberOfAnts > 0) {
                mergedAnts.push(newAnt);
            }
        }
    });
    return mergedAnts;
}