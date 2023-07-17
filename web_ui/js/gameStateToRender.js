

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
Given an array of antStates some of which may be at the same location, returns a new array of new antStates
in which the ants at the same location are merged into one ant stack (antState)
 */
function mergeAnts(ants){
    const mergedAnts = [];
    const merged = ants.map(ant=>false);

    ants.forEach((ant, antNumber) => {
        if (!merged[antNumber]){
            const antsAt = getAntNumsAt(ants, ant.location, antNumber);
            let newAnt = structuredClone(ant);

            //const obj4 = structuredClone(obj3);
            let copiedLocation = [ant.location[0], ant.location[1]];
            newAnt.location = copiedLocation;
            newAnt.numberOfAnts = 0;
            antsAt.forEach((antToMergeNumber)=>{
                const antToMerge = ants[antToMergeNumber];
                if (antToMerge.cast === newAnt.cast){
                    merged[antToMergeNumber] = true;
                    newAnt.numberOfAnts = newAnt.numberOfAnts + antToMerge.numberOfAnts;
                }

            });
            mergedAnts.push(newAnt);
        }
    });
    return mergedAnts;
}