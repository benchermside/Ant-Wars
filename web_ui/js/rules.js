/*
 * Contains code to enforce the rules of the game.
 */

// This updates after a set of moves has been selected. It is passed a GameState (see dataStructures.js)
// and a colonySelections. It returns the new GameState.
//
const notMovable = new Set([0, 1, 2, 3]) //list of all hex types that you CANNOT move through
const castMovementSpeeds = {"Worker":2, "Queen":1, "Soldier":2} //matches each ant to their movement speed



// This finds the list of allowed locations an ant can move to. It is passed a GameState (see
// dataStructures.js), an integer specifying which colony we want the moves for, and an integer
// specifying which ant in that colony we want the moves of. It returns a MoveLocations.
function possibleMoves(gameState, colonyNumber, antNumber) {
    const notMovable = new Set([0, 1, 2, 3])   //list of all hex types that you CANNOT move through
    const possibleMoves = [];
    const numSteps = 1;
    const gridHeight = gameState.terrainGrid.length;
    const gridLength = gameState.terrainGrid[0].length;
    const antStartX = gameState.colonies[colonyNumber].ants[antNumber].location[0];
    const antStartY = gameState.colonies[colonyNumber].ants[antNumber].location[1];
    possibleMoves.push([antStartX-1 + (antStartY%2), antStartY+1]);
    possibleMoves.push([antStartX + (antStartY%2), antStartY+1]);
    possibleMoves.push([antStartX-1, antStartY]);
    possibleMoves.push([antStartX, antStartY]);
    possibleMoves.push([antStartX+1, antStartY]);
    possibleMoves.push([antStartX-1 + (antStartY%2), antStartY-1]);
    possibleMoves.push([antStartX + (antStartY%2), antStartY-1]);
    const validMoves = possibleMoves.filter(move => {
        if(move[0] >= 0 && move[0] < gridLength && move[1] >= 0 && move[1] < gridHeight){
            var currPos = gameState.terrainGrid[move[1]][move[0]];
            if(!notMovable.has(currPos)){ //if the space type is NOT a type you cannot move through
                return true;
            }
        }
        return false;
    });
    return validMoves;
}


//helper function for new possable moves
//returns true if the location in moves
function spaceReached(moves, location){
    for(let movesIndex=0; movesIndex<moves.length; movesIndex++){
        if(!(moves[movesIndex][JSON.stringify(location)] === undefined)){
            return true;
        }
    }
    return false;

}

//helper for possable moves
//takes in a place and gives the list of moves to get there
function generateSteps(destination){
    if(destination === null){
        return [];
    }
    else{
        const toReturn = generateSteps(destination.prevLocation);
        toReturn.push(destination.coord);
        return toReturn;
    }
}

//helper for possable moves
//takes a list of ant stacks and checks if all ant stacks are in the same cast, if so returns true. oatherwise returns false
function isCast(ants, cast){
    for(var i=0; i<ants.length; i++){
        if(!(ants[i].cast === cast)){
            return false;
        }
    }
    return true;
}

// FIXME: Rename this
function newPossibleMoves(gameState, colonyNumber, antNumber){
    const movingAnt = gameState.colonies[colonyNumber].ants[antNumber];
    const movementSpeed = castMovementSpeeds[movingAnt.cast];
    const moves = [];
    moves[0] = {};
    moves[0][JSON.stringify(movingAnt.location)] = {"coord": movingAnt.location, "prevLocation": null};
    for(let moveNumber = 1; moveNumber <= movementSpeed; moveNumber++){
        moves[moveNumber] = {};
        for(let space in moves[moveNumber-1]){
            const prevLocation = JSON.parse(space);
            const neighbors = findNeighbors(gameState.terrainGrid, prevLocation[0], prevLocation[1]);
            for (let neighborIndex = 0; neighborIndex<neighbors.length; neighborIndex++){
                const currNeighbor = neighbors[neighborIndex];
                if (!notMovable.has(gameState.terrainGrid[currNeighbor[1]][currNeighbor[0]])){
                    if (!spaceReached(moves, currNeighbor)){
                        moves[moveNumber][JSON.stringify(currNeighbor)] = {"coord": currNeighbor, "prevLocation": moves[moveNumber-1][space]};
                    }
                }
            }
            
        }
    }
    const toReturn = [];
    for(let index=moves.length; index > -1; index=index-1){
        for(let destination in moves[index]){
            let playerColony = 0; // which colony (by number) the current player is running
            const occupents = getAntsAt(gameState.colonies[colonyNumber].ants, moves[index][destination].coord);
            if(isCast(occupents, movingAnt.cast)) {
                const steps = generateSteps(moves[index][destination]);
                const action = {
                    "name": "Move",
                    "steps": steps,
                };
                toReturn.push(action);
            }
        }
    }
    return toReturn;
}




/*
 * This finds the list of allowed dig actions with whatToDig = "Tunnel" for a specific ant (there might
 * not be any!). It is passed a GameState (see dataStructures.js), an integer specifying which colony we
 * want the moves for, and an integer specifying which ant in that colony we want the moves of. It returns
 * a list of Action objects (see dataStructures.js) all of which are Dig actions with whatToDig of "Tunnel".
 */
function possibleDigTunnelActions(gameState, colonyNumber, antNumber) {
    const antLocation = gameState.colonies[colonyNumber].ants[antNumber].location;
    // Tunneling can happen only in dirt and only in a neighboring location
    const eligibleTerrain = 1;
    return findNeighbors(gameState.terrainGrid, antLocation[0], antLocation[1])
        .filter(loc => gameState.terrainGrid[loc[1]][loc[0]] === eligibleTerrain)
        .map(loc => {
            return {name: "Dig", location: loc, whatToDig: "Tunnel"};
        });
}


/*
 * This finds the list of allowed dig actions with whatToDig = "Chamber" for a specific ant (there might
 * not be any!). It is passed a GameState (see dataStructures.js), an integer specifying which colony we
 * want the moves for, and an integer specifying which ant in that colony we want the moves of. It returns
 * a list of Action objects (see dataStructures.js) all of which are Dig actions with whatToDig of "Chamber".
 */
function possibleDigChamberActions(gameState, colonyNumber, antNumber) {
    const antLocation = gameState.colonies[colonyNumber].ants[antNumber].location;
    // Chambers can only be dug on an existing tunnel and only in the current location
    const eligibleTerrain = 4;
    if (gameState.terrainGrid[antLocation[1]][antLocation[0]] === eligibleTerrain) {
        return [{name: "Dig", location: antLocation, whatToDig: "Chamber"}];
    } else {
        return [];
    }
}


//for testing delete later
const TESTING = false;
if (TESTING) {
    console.log("hello");
    let currentGameState = {
        "terrainGrid": [
            [3, 3, 3, 3, 3, 3],
            [2, 1, 1, 1, 2, 1],
            [2, 2, 1, 1, 1, 1],
            [2, 2, 1, 1, 1, 2],
            [0, 0, 0, 0, 0, 0],
        ],
        colonies: [
            {
                ants: [
                    {
                        "location": [2, 1]
                    },
                    {
                        "location": [0, 0]
                    }
                ],
                foodSupply: 20,
                antColor: "#000000",
            },
        ],
    };
    console.log(possibleMoves(currentGameState, 0, 0));
}
//for testing delete later
const inputState = {
    "terrainGrid": [
        [3, 3, 3, 3, 3, 3],
          [2, 4, 6, 5, 2, 1],
        [2, 2, 6, 4, 5, 3],
          [2, 2, 4, 4, 6, 2],
        [0, 0, 0, 4, 0, 0],
    ],
    "colonies": [
        {
            "ants": [
                {
                    "cast": "Worker",
                    "facing": 7,
                    "location": [2, 1],
                    "numberOfAnts": 9
                },
                {
                    "cast": "Queen",
                    "facing": 3,
                    "location": [4, 3],
                    "numberOfAnts": 2
                }
            ],
            "foodSupply": 20,
            "antColor": "#000000",
        },
    ],
};
const testColonyNumber = 0;
const antNumber = 0;

//
