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
    //   4: Dug-dirt
    //   5: chamber (dirt background)
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
    //   * cast - this is either "Worker", "Queen", or "Warrior".
    //   * facing - a number 0..11 showing which way the ant is facing. 0 is straight down.
    //   * location - an [x,y] grid coordinate giving the location of the ant between turns
    //                and the intended destination of the ant while entering commands.
    //   * startLocation - This contains the [x,y] grid coordinate where the ant started at
    //                the beginning of the current turn.
    //   *numberOfAnts - the number of ants in the stack
    // Example:
    const antState = {
        "cast": "Worker",
        "facing": 1,
        "location": [2, 3],
        "startLocation": [2, 3],
        "numberOfAnts":3,
    };


    // ColonyState:
    //
    // A ColonyState tells the current state of an ant colony BETWEEN turns. Ant colonies have
    // a list of ants and they also have properties like foodSupply.
    //
    // It is an object with the following fields:
    //   * ants: an array of AntState, one for each ant.
    //   * foodSupply: a number giving the amount of food the ant colony has
    //   * antColor: a string to use for coloring the ants of this colony.
    //
    // Example:
    const colonyState = {
        "ants": [
            {
                "cast": "Worker",
                "facing": 7,
                "location": [2, 1],
                "numberOfAnts": 3
            },
            {
                "cast": "Queen",
                "facing": 3,
                "location": [4, 3],
                numberOfAnts: 1
            }
        ],
        "foodSupply": 20,
        "antColor": "#000000",
    };


    // GameState:
    //
    // A GameState shows the current state of the game (in between turns, not while actually ENTERING a
    // turn).
    //
    // It is an object with a few fields:
    //    terrainGrid: a TerrainGrid
    //    colonies: a list of ColonyState
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
    //      * Means that this ant moves to a new location.
    //      * Additional fields:
    //         * "destination" a field of type Location, telling where the ant ends up.
    //   * "NewMove":
    //      * This is the NEW design for the "Move" action. It will replace the old Moves,
    //        so it means that this ant moves to a new location. After we migrate to it,
    //        we'll rename this to "Move".
    //      * Additional fields:
    //         * "steps" is a list of type Location. The locations tell where the ant
    //           travels during this turn. The first location in the list will always be
    //           the ant's current location at the start of this turn. The last location
    //           in the list will always be the spot where the ant ends up. And each
    //           pair of adjacent locations in the list will be adjacent hexagons.
    //   * "LayEgg":
    //      * Means that this ant will lay an egg (only Queens do this).
    //      * Additional fields: There are no additional fields (the egg is laid wherever the Queen is)
    //
    // Examples:
    const action1 = {
        "name": "None"
    };
    const action2 = {
        "name": "Move",
        "destination": [4, 4]
    };
    const action3 = {
        "name": "NewMove",
        "steps": [
            [5, 6],
            [4, 5],
            [4, 4],
        ],
    }
    const action4 = {
        "name": "LayEgg",
    }



    // ColonySelections:
    //
    // A ColonySelections stores the information about what a particular colony wants to do on a turn.
    //
    // It is an object with a single field, actionSelections which is a lists of Actions that is
    // exactly the same length as the list of ants in the GameState.
    //
    // Example:
    const colonySelections = {
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

}
