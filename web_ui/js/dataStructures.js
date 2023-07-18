/*
 * Contains definitions of data structures we will use.
 */

{

    // TerrainId:
    //
    // A TerrainId is an integer that indicates a particular kind of background. The allowed
    // values are:
    //   0: Bedrock
    //   1: Dirt
    //   2: Stone
    //   3: Sky
    //   4: Dirt with Tunnel
    //   5: Dirt with Chamber
    //   6: Surface
    //
    // Example:
    const terrainId = 1;


    // TerrainGrid:
    //
    // A TerrainGrid defines what types the cells are within the entire game board.
    //
    // It is stored as a 2D array of TerrainIds. The outer list contains a list for each row, starting
    // from the top. Each row is always the same length. The odd-numbered rows are offset 1/2 a cell
    // to the right (because it's a hex grid, not a square grid).
    //
    // Example:
    const startingGrid = [
        [3, 3, 3, 3, 3, 3],
          [2, 1, 1, 1, 2, 1],
        [2, 2, 1, 1, 1, 1],
          [2, 2, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0],
    ];
    //
    // That is a grid with sky at the top, bedrock at the bottom, and a few scattered stones with
    // some dirt in between.


    // WhatToDig:
    //
    // A WhatToDig is a simple enum specifying the different improvements that an ant can create.
    //
    // It is a string, which must be either "Tunnel" or "Chamber".
    //
    const whatToDig = "Tunnel";


    // Location:
    //
    // A location is the way of specifying a particular spot on the hex grid.
    //
    // It is a list containing two numbers, the x coordinate and the y coordinate of the TerrainGrid.
    // So if "location" is a Location and terrainGrid is a TerrainGrid, then the terrain there is:
    //    terrainGrid[location[1]][location[2]]
    //
    // Example:
    const location = [2,3];


    // AntState:
    //
    // An AntState tells the current state of a stack of ants BETWEEN turns.
    // Ant stacks have multiple ants in one location.   Ant stacks must be all the same cast of ant
    //
    // It is an object, with fields:
    //   * cast - this is either "Worker", "Queen", "Soldier", or "Larva".
    //   * facing - a number 0..11 showing which way the ant is facing. 0 is straight down.
    //   * location - an [x,y] grid coordinate giving the location of the ant.
    //   * numberOfAnts - the number of ants in the stack
    //   * foodHeld - a non-negative integer telling the amount of food held by this ant.
    // Example:
    const antState = {
        "cast": "Worker",
        "facing": 1,
        "location": [2, 3],
        "numberOfAnts": 3,
        "foodHeld": 0,
    };


    // ColonyState:
    //
    // A ColonyState tells the current state of an ant colony BETWEEN turns. Ant colonies have
    // a list of ants, a list of eggs and they also have properties like foodSupply.
    //
    // It is an object with the following fields:
    //   * eggs: an array of EggStack, one for each stack of eggs in a given location (there can
    //           only be one egg stack at a given location
    //   * ants: an array of AntState, one for each ant.

    //   * foodSupply: a number giving the amount of food the ant colony has
    //   * antColor: a string to use for coloring the ants of this colony.
    //
    // Example:
    const colonyState = {
        "eggs":[
            {
                "numberOfEggs": 1,
                "location": [7, 3],
                "daysToHatch": 3
            },
        ],
        "ants": [
            {
                "cast": "Worker",
                "facing": 7,
                "location": [2, 1],
                "numberOfAnts": 3,
                "foodHeld": 0,
            },
            {
                "cast": "Queen",
                "facing": 3,
                "location": [4, 3],
                "numberOfAnts": 1,
                "foodHeld": 0,
            }
        ],
        "foodSupply": 20,
        "antColor": "#000000",
    };


    // FoodItem:
    //
    // A FoodItem represents a particular bit of food which can be collected by ants to carry
    // back to the nest and feed the colony. Different FoodItems have different appearances
    // and they have a foodValue.
    //
    // It is an object with a few fields:
    //   * appearance: one of the following strings: "BasicParticle", "DeadAnt"
    //   * location: an [x,y] grid coordinate giving the location of the food item.
    //   * foodValue: a non-negative integer indicating how much food energy it can provide.
    //
    // Example:
    const foodItem = {
        "appearance": "BasicParticle",
        "location": [5,3],
        "foodValue": 4,
    };


    // GameState:
    //
    // A GameState shows the current state of the game
    //
    // It is an object with a few fields:
    //    terrainGrid: a TerrainGrid
    //    colonies: a list of ColonyState
    //    foodItems: a list of FoodItem. We ensure that at most 1 food item will be in any given location
    //
    // Example:
    const currentGameState = {
        "terrainGrid": [
            [3, 3, 3, 3, 3, 3],
              [2, 1, 1, 1, 2, 1],
            [2, 2, 1, 1, 1, 1],
              [2, 2, 1, 1, 1, 2],
            [0, 0, 0, 0, 0, 0],
        ],
        "colonies": [
            {
                "eggs":[
                    {
                        "numberOfEggs": 1,
                        "location": [7, 3],
                        "daysToHatch": 3
                    },
                ],

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
                    },
                    {
                        "cast": "Larva",
                        "facing": 5,
                        "location": [4,4],
                        "numberOfAnts": 3,
                        "foodHeld": 0,
                    }
                ],
                "foodSupply": 20,
                "antColor": "#000000",
            },
        ],
        "foodItems": [
            {
                "appearance": "BasicParticle",
                "location": [3,1],
                "foodValue": 1,
            },
            {
                "appearance": "DeadAnt",
                "location": [3,3],
                "foodValue": 4,
            },
        ],
    };



    // Action
    //
    // An Action is one of the kinds of action that an ant can take.
    //
    // Each Action is an object that has a "name" field, but based on the "name" field, it may have other
    // fields too.
    //
    // The allowed names are:
    //   * "None":
    //      * Means that this ant takes no action.
    //      * Additional fields: There are no additional fields.
    //   * "Move":
    //      * This means that this ant moves to a new location (through a series of steps.)
    //      * Additional fields:
    //         * "steps" is a list of type Location. The locations tell where the ant
    //           travels during this turn. The first location in the list will always be
    //           the ant's current location at the start of this turn. The last location
    //           in the list will always be the spot where the ant ends up. And each
    //           pair of adjacent locations in the list will be adjacent hexagons.
    //   * "Defend":
    //      * Means that the ant doesn't move and attacks adjacent or overlapping enemy ants.
    //      * Additional fields: There are no additional fields.
    //   * "LayEgg":
    //      * Means that this ant will lay an egg (only Queens do this).
    //      * Additional fields: There are no additional fields (the egg is laid wherever the Queen is)
    //   * "Dig":
    //      * Means that this ant will dig a tunnel.
    //      * Additional fields:
    //         * "location" a field of type Location, telling which space gets dug.
    //         * "whatToDig" is a field containing a WhatToDig telling what will result after
    //            the dig.
    //
    // Examples:
    const action1 = {
        "name": "None"
    };
    const action2 = {
        "name": "Move",
        "steps": [
            [5, 6],
            [4, 5],
            [4, 4],
        ],
    };
    const action3 = {
        "name": "LayEgg",
    };
    const action4 = {
        "name": "Dig",
        "location": [6,4],
        "whatToDig": "Tunnel",
    };
    const action5 = {
        "name": "Defend",
    };



    // ColonySelection:
    //
    // A ColonySelection stores the information about what a particular colony wants to do on a turn.
    //
    // It is an object with the following fields:
    //  * isReadyForEndOfTurn - a boolean; true means the player is ready for the turn to end.
    //  * actionSelections - a list of Actions that is exactly the same length as the list
    //         of ants in the GameState, although some of the entries can be null instead of
    //         being a valid action (which means that ant didn't specify what to do).
    //
    // Example:
    const colonySelection = {
        isReadyForEndOfTurn: true,
        actionSelections: [
            {"name": "None"},
            {"name": "Move", "destination": [2, 3]},
        ]
    };


    // MoveLocations:
    //
    // This describes all the places an ant can go.
    //
    // It is a list of Locations. If the ant is allowed to stay in place it will include the ant's
    // current location.
    //
    // Example:
    let moveLocations = [
        [1, 1],
        [2, 1],
        [2, 2],
        [3, 1],
        [3, 2],
    ];


    // Indicator:
    //
    // This describes how a hex is indicated.
    //
    // It is an object with two fields:
    //   * location: an [x,y] grid coordinate of the hex
    //   * color: a color string for the color of the indicator. Most color strings
    //        will be partly transparent.
    //
    // Example:
    let indicator = {
        location: [3,4],
        color: "#FFFF0066",
    }


    // Interactions:
    //
    // This describes all the interactions between different colonies that that happened in a
    // particular stage of enacting a turn.
    //
    // In the future we almost certainly will need a whole different structure, but for now the
    // ONLY kind of interaction that can happen is loss of ants from some stacks. So this is
    // simply a list of {colonyNumber, antNumber, numberLost} objects. The count is only the
    // amount lost in THIS stage, NOT the cumulative amount lost since the beginning of the turn.
    //
    // The field numberLost must always be a non-negative integer, but it CAN be zero (which is an
    // interaction that has no effect).
    //
    // Example:
    let interactions = [
        {colonyNumber: 0, antNumber: 2, numberLost: 2},
        {colonyNumber: 1, antNumber: 1, numberLost: 1},
    ];

    // Player:
    //
    // The specification for who will be playing.
    //
    // This is an object with the following fields:
    //  * playerType - this is either "Human" or "AI".
    //  * username - the username of this participant (whether human or AI).
    //  * aiType - the type of the AI. This is used ONLY if playerType === "AI". The
    //       only allowed value is "RandomMover".
    //
    // Example:
    const player1 = {
        playerType: "Human",
        username: "Ann",
    };
    const player2 = {
        playerType: "AI",
        username: "RandomRobot",
        aiType: "RandomMover",
    };
    

    // GameSettings:
    //
    // This contains the information needed to start up a game.
    //
    // It has the following fields:
    //  * gameCode - the numeric ID of the game
    //  * map - the code for the particular map the game will use. "map1" is the only valid value now.
    //  * rules - the code for the particular rules the game will use. "rules1" is the only valid value now.
    //  * playerList - an array of Player objects, one for each player. The first one in the list will
    //        be the one that's the host.
    //
    // Example:
    let gameSettings = {
        gameCode: "87634",
        map: "map1",
        rules: "rules1",
        playerList: [
            { playerType: "Human", username: "Ann" },
            { playerType: "AI", username: "RandomRobot", aiType: "RandomMover" },
        ],
    };

}
