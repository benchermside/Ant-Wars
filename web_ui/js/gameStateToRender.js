function getGameStateToRender(){
    return gameStateToRender;
}

function moveRenderedAnt(){
    return gameStateToRender()
}

/*
Given an array of antStates, Returns an array of indexes into that array that indicate the
ants at the specified coord.  If beginIndex is given returns ants from that index to the end of the
array.  If it is not specified returns all ants at that coord.
 */
function getAntsAt(ants, coord, beginIndex){
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
Given an array of antStates some of which may be at the same location, returns a new array of new antStates
in which the ants at the same location are merged into one ant stack (antState)
 */
function mergeAnts(ants){
    const mergedAnts = [];
    const merged = ants.map(ant=>false);

    ants.forEach((ant, antNumber) => {
        if (!merged[antNumber]){
            const antsAt = getAntsAt(ants, ant.location, antNumber);
            let newAnt = Object.assign({}, ant);
            console.log ("before newAnt ", newAnt)

            //const obj4 = structuredClone(obj3);
            let copiedLocation = [ant.location[0], ant.location[1]];
            newAnt.location = copiedLocation;
            newAnt.numberOfAnts = 0;
            console.log ("after newAnt ", newAnt)
            antsAt.forEach((antToMergeNumber)=>{
                merged[antToMergeNumber] = true;
                const antToMerge = ants[antToMergeNumber];
                if (antToMerge.cast !== newAnt.cast){
                    throw Error("Error: ant merge not of same cast");
                }
                newAnt.numberOfAnts = newAnt.numberOfAnts + antToMerge.numberOfAnts;
            });
            mergedAnts.push(newAnt);
        }
    });
    return mergedAnts;
}