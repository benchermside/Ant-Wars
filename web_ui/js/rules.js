/*
 * Contains code to enforce the rules of the game.
 */

// This updates after a set of moves has been selected. It is passed a GameState (see dataStructures.js)
// and a actionSelection. It returns the new GameState.
//
function applyRules(gameState, actionSelection) {
    // As a placeholder, we'll return the gameState unmodified
    return gameState;
}

// This finds the list of allowed locations an ant can move to. It is passed a GameState (see
// dataStructures.js) and an integer specifying which ant we want the moves of. It returns a
// MoveLocations.
function possibleMoves(gameState, antNumber) {
    const notMovable = new Set([0, 2, 3])   //list of all hex types that you CANNOT move through
    const possibleMoves = [];
    const numSteps = 1;
    const gridHeight = gameState.terrainGrid.length;
    const gridLength = gameState.terrainGrid[0].length;
    const antStartX = gameState.ants[antNumber].location[0];
    const antStartY = gameState.ants[antNumber].location[1];
    possibleMoves.push([antStartX-1 + (antStartY%2), antStartY+1]);
    possibleMoves.push([antStartX + (antStartY%2), antStartY+1]);
    possibleMoves.push([antStartX-1, antStartY]);
    possibleMoves.push([antStartX, antStartY]);
    possibleMoves.push([antStartX+1, antStartY]);
    possibleMoves.push([antStartX-1 + (antStartY%2), antStartY-1]);
    possibleMoves.push([antStartX + (antStartY%2), antStartY-1]);
    validMoves = [];
    // for(var i=0; i<possibleMoves.length; i++){
    //     if(possibleMoves[i][0] >= 0 && possibleMoves[i][0] < gridLength && possibleMoves[i][1] >= 0 && possibleMoves[i][1] < gridHeight){
    //         var currPos = gameState.terrainGrid[possibleMoves[i][1]][possibleMoves[i][0]];
    //         if(!notMovable.has(currPos)){ //if the space type is NOT a type you cannot move thorugh
    //             validMoves.push(possibleMoves[i]);
    //         }
    //     }
    // }
    possibleMoves.forEach(move => {
        if(move[0] >= 0 && move[0] < gridLength && move[1] >= 0 && move[1] < gridHeight){
            var currPos = gameState.terrainGrid[move[1]][move[0]];
            if(!notMovable.has(currPos)){ //if the space type is NOT a type you cannot move thorugh
                validMoves.push(move);
            }
        }
    });
    return validMoves;
}

//for testing delete later
console.log("hello");
let currentGameState = {
     "terrainGrid": [
         [3, 3, 3, 3, 3, 3],
          [2, 1, 1, 1, 2, 1],
         [2, 2, 1, 1, 1, 1],
          [2, 2, 1, 1, 1, 2],
         [0, 0, 0, 0, 0, 0],
     ],
     "ants": [
         {
             "location": [2, 1]
         },
         {
             "location": [0, 0]
         }
     ]
};
 console.log(possibleMoves(currentGameState, 1));
//for testing delete later
