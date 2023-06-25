/*
 * Contains code to enforce the rules of the game.
 */

// This updates after a set of moves has been selected. It is passed a GameState (see dataStructures.js)
// and a colonySelections. It returns the new GameState.
//
const notMovable = new Set([0, 1, 2, 3]) //list of all hex types that you CANNOT move through
const castMovementSpeeds = {"Worker":2, "Queen":1, "Warrior":2} //matches each ant to there movement speed



function applyRules(gameState, colonySelections) {
    // FIXME: Should enforce the rules.
    colonySelections.forEach((colonySelections, colonyNumber) => {
        colonySelections.actionSelections.forEach((action, antNumber) => {
            if (action.name === "None") {
                // do nothing
            } else if (action.name === "Move") {
                gameState.colonies[colonyNumber].ants[antNumber].location = action.destination;
            } else if (action.name === "LayEgg") {
                // do nothing... laying an egg doesn't work yet. FIXME: Make it work someday!
            } else if (action.name === "DigTunnel") {
                const coord = action.location;
                gameState.terrainGrid[coord[1]][coord[0]] = 4; // change it to dug dirt
                gameState.colonies[colonyNumber].ants[antNumber].location = action.location; // move the ant
            } else {
                throw Error("Invalid type for action");
            }
        })
    });
    return gameState;
}

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

function newPossibleMoves(gameState, colonyNumber, antNumber){
    const movingAnt = gameState.colonies[colonyNumber].ants[antNumber];
    const movementSpeed = castMovementSpeeds[movingAnt.cast];
    const moves = [];
    moves[0] = {movingAnt.location:[movingAnt.location, null]};    
}


/*
 * This finds the list of allowed dig actions for a specific ant (there might not be any!). It is passed
 * a GameState (see dataStructures.js), an integer specifying which colony we want the moves for, and an
 * integer specifying which ant in that colony we want the moves of. It returns a list of Action objects
 * (see dataStructures.js) all of which are DigTunnel actions.
 */
function possibleDigTunnelActions(gameState, colonyNumber, antNumber) {
    const antLocation = gameState.colonies[colonyNumber].ants[antNumber].location;
    return findNeighbors(gameState.terrainGrid, antLocation[0], antLocation[1])
        .filter(loc => gameState.terrainGrid[loc[1]][loc[0]] === 1)
        .map(loc => {
            return {name: "DigTunnel", location: loc};
        });
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
          [2, 1, 1, 1, 2, 1],
        [2, 2, 1, 1, 1, 1],
          [2, 2, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0],
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
const antNumber = 1;
newPossibleMoves(inputState, testColonyNumber, antNumber);
console.log("test compleat");

//
