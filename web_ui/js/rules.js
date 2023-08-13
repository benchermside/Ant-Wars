/*
 * Contains code to enforce the rules of the game.
 */

// This updates after a set of moves has been selected. It is passed a GameState (see dataStructures.js)
// and a ColonySelection. It returns the new GameState.
//
const notMovable = new Set([0, 1, 2, 3]) //list of all hex types that you CANNOT move through




//helper function for new possible moves
//returns true if the location in moves
function spaceReached(moves, location) {
    for(let movesIndex=0; movesIndex<moves.length; movesIndex++) {
        if(!(moves[movesIndex][JSON.stringify(location)] === undefined)) {
            return true;
        }
    }
    return false;

}

//helper for possable moves
//takes in a place and gives the list of moves to get there
function generateSteps(destination) {
    if(destination === null){
        return [];
    }
    else{
        const toReturn = generateSteps(destination.prevLocation);
        toReturn.push(destination.coord);
        return toReturn;
    }
}

//helper for possibleMoves
//takes a list of ant stacks and checks if all ant stacks are in the same cast, if so returns true. oatherwise returns false
function isCast(ants, cast) {
    for(let i=0; i<ants.length; i++) {
        if(!(ants[i].cast === cast)) {
            return false;
        }
    }
    return true;
}



// finds the allowed moves an ant can move to and returns a list of the paths
// of those moves (I think)

function getStepsList(gameState, displayedGameState, colonyNumber, antNumber, moveDistance) {
    const movingAnt = displayedGameState.colonies[colonyNumber].ants[antNumber];
    //moves is a list of objects used as hashtables.  Each hashtable is indexed by the coord destination the ant can move to
    //as a json string and contains an object which has the field coord and prevLocation.  coord represents the
    //same location as the index (the destination) in a two length array.
    //The prevLocation represents the previous location in the path to that spot.
    const moves = [];
    moves[0] = {};
    moves[0][JSON.stringify(movingAnt.location)] = {"coord": movingAnt.location, "prevLocation": null};
    for(let moveNumber = 1; moveNumber <= moveDistance; moveNumber++) {
        moves[moveNumber] = {};
        for(let space in moves[moveNumber-1]) {
            const prevLocation = JSON.parse(space);
            const neighbors = findNeighbors(gameState.terrainGrid, prevLocation[0], prevLocation[1]);
            for (let neighborIndex = 0; neighborIndex<neighbors.length; neighborIndex++) {
                const currNeighbor = neighbors[neighborIndex];
                if (!notMovable.has(gameState.terrainGrid[currNeighbor[1]][currNeighbor[0]])) {
                    if (!spaceReached(moves, currNeighbor)) {
                        moves[moveNumber][JSON.stringify(currNeighbor)] = {"coord": currNeighbor, "prevLocation": moves[moveNumber-1][space]};
                    }
                }
            }
        }
    }
    const toReturn = [];
    for(let index=moves.length; index > -1; index=index-1) {
        for(let destination in moves[index]) {
            const occupants = getAntStatesAt(displayedGameState.colonies[colonyNumber].ants, moves[index][destination].coord);
            if(isCast(occupants, movingAnt.cast)) {
                const steps = generateSteps(moves[index][destination]);
                toReturn.push(steps);
            }
        }
    }
    return toReturn;
}

function possibleMoves(gameState, displayedGameState, colonyNumber, antNumber) {
    const moveDistance = rules.movementSpeed[displayedGameState.colonies[colonyNumber].ants[antNumber].cast];
    return getStepsList(gameState, displayedGameState, colonyNumber, antNumber, moveDistance).map(steps => {
        return {
            "name": "Move",
            "steps": steps,
        };
    });
}

/*
 * returns the list of possible attack actions that antNumber the ant, specified by colonyNumber and antNumber, can take.
 */
function possibleAttackActions(gameState, displayedGameState, colonyNumber, antNumber) {
    const moveDistance = rules.attackSpeed[displayedGameState.colonies[colonyNumber].ants[antNumber].cast];
    return getStepsList(gameState, displayedGameState, colonyNumber, antNumber, moveDistance).map(steps => {
        return {
            "name": "Attack",
            "steps": steps,
        };
    });
}

/*
 * This finds the list of allowed dig actions with whatToDig = "Tunnel" for a specific ant (there might
 * not be any!). It is passed a GameState (see dataStructures.js), an integer specifying which colony we
 * want the moves for, and an integer specifying which ant in that colony we want the moves of. It returns
 * a list of Action objects (see dataStructures.js) all of which are Dig actions with whatToDig of "Tunnel".
 */
function possibleDigTunnelActions(gameState, startOfTurnGameState, colonyNumber, antNumber) {
    const antLocation = gameState.colonies[colonyNumber].ants[antNumber].location;
    // Tunneling can happen only in dirt and only in a neighboring location
    const eligibleTerrain = 1;
    return findNeighbors(startOfTurnGameState.terrainGrid, antLocation[0], antLocation[1])
        .filter(loc => startOfTurnGameState.terrainGrid[loc[1]][loc[0]] === eligibleTerrain)
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
function possibleDigChamberActions(gameState, startOfTurnGameState, colonyNumber, antNumber) {
    const antLocation = gameState.colonies[colonyNumber].ants[antNumber].location;
    // Chambers can only be dug on an existing tunnel and only in the current location
    const eligibleTerrain = 4;
    const existingTerrain = startOfTurnGameState.terrainGrid[antLocation[1]][antLocation[0]];
    if (existingTerrain === eligibleTerrain) {
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
                    "numberOfAnts": 9,
                    "foodHeld": 0,
                },
                {
                    "cast": "Queen",
                    "facing": 3,
                    "location": [4, 3],
                    "numberOfAnts": 2,
                    "foodHeld": 0,
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
