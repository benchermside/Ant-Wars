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


    // Cast:
    //
    // A Cast is a string which indicates what type an ant is.
    //
    // It can take on the values "Worker", "Queen", "Soldier", or "Larva".
    //
    const cast = "Queen";


    // AntState:
    //
    // An AntState tells the current state of a stack of ants. An AntState may have multiple ants of the
    // same cast that are in the same location.
    //
    // It is an object, with fields:
    //   * cast - this is a string of type Cast.
    //   * facing - a number 0..11 showing which way the ant is facing. 0 is straight down.
    //   * location - an [x,y] grid coordinate giving the location of the ant.
    //   * numberOfAnts - the number of ants in the stack
    //   * foodHeld - a non-negative integer telling the amount of food held by this ant.
    // Example:
    const antStack = {
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
    //   * appearance: one of the following strings: "BasicParticle", "FunkyParticle", "DeadAnt" (NOTE: DeadAnt not supported yet)
    //   * location: an [x,y] grid coordinate giving the location of the food item.
    //   * foodValue: a non-negative integer indicating how much food energy it can provide.
    //   * facing: a number, 0..11 which shows how the food is facing. (This is visual only, and has no effect.)
    //
    // Example:
    const foodItem = {
        "appearance": "BasicParticle",
        "location": [5,3],
        "foodValue": 4,
        "facing": 3,
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
                "facing": 4,
            },
            {
                "appearance": "DeadAnt",
                "location": [3,3],
                "foodValue": 4,
                "facing": 7,
            },
        ],
    };



    // NewAntOrigin
    //
    // When the displayedGameState has additional ants that aren't found in the startOfTurnGameState, we may
    // need to know how they came to be. This data structure specifies the origin of a single new ant, and
    // we will keep an array of them in the same order as the new ants.
    //
    // Each NewAntOrigin is an object that has a "source" field, and based on the "source" field it may have
    // additional fields.
    //
    // The allowed values for "source" are:
    //   * "Matured":
    //       * Means that a larva matured to create this.
    //       * Additional fields:
    //           * "antNumber": the ant number of the larva stack that matured
    //   * "Hatched": - NOT ACTUALLY SUPPORTED YET
    //       * Means that an egg hatched to create this.
    //   * "Split":
    //       * Means that a stack split to create this. The original stack remains the list of existing ants.
    //       * Additional fields:
    //           * "antNumber": The ant number of the ant stack that was split
    //           * "order": the position in the list of pieces this stack split into. Will be >= 1 (because
    //             the 0th is the original stack).
    //
    // Examples:
    const newAntOrigin1 = {
        "source": "Matured",
        "antNumber": 3,
    };
    const newAntOrigin2 = {
        "source": "Split",
        "antNumber": 4,
        "order": 1,
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
    //   * "Attack":
    //      * This means that this ant moves to a new location (through a series of steps.) while picking fights
    //          with adjacent and overlapping enemy ants.
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
    //           the dig.
    //   * "Mature":
    //      * Means that this larva will mature into an ant.
    //      * Additional fields:
    //         * "cast": the Cast that the larva will mature into.
    //   * "Split":
    //      * Means that this stack will split into 2 sub-stacks. Also contains the action each sub-stack will take.
    //      * Additional fields:
    //         * "stackCounts": an array of length 2 or more, describing how this stack splits into new stacks. The
    //           array contains a list of numbers, each of which must be >= 1 and represents the size of one stack.
    //           The sum of the list must be the number of ants in the stack.
    //         * "actions": An array telling what each split stack does. The array will be the same length as
    //           stackCounts. Each item in the array will be an Action other than Split, or null if this split stack
    //           hasn't been given an instruction.
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
        "name": "Attack",
        "steps": [
            [5, 6],
            [5, 7]
        ]
    }
    const action6 = {
        "name": "Defend",
    };
    const action7 = {
        "name": "Mature",
        "cast": "Worker",
    }
    const action8 = {
        "name": "Split",
        "newStackCounts": [3, 2],
        "actions": [
            {
                "name": "Move",
                "steps": [
                    [5, 6],
                    [4, 5],
                    [4, 4],
                ],
            },
            {
                "name": "Defend",
            },
        ]
    }



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
    //  * map - the code for the particular map the game will use. "standard" is one valid value.
    //  * rules - the code for the particular rules the game will use. "standard" is one valid value.
    //  * playerList - an array of Player objects, one for each player. The first one in the list will
    //        be the one that's the host.
    //
    // Example:
    const gameSettings = {
        gameCode: "87634",
        map: "standard",
        rules: "standard",
        playerList: [
            { playerType: "Human", username: "Ann" },
            { playerType: "AI", username: "RandomRobot", aiType: "RandomMover" },
        ],
    };


    // UIControls
    //
    // This data structure tells the UI what temporary or modal controls to display.
    //
    // It is an object containing the following fields:
    //   * "actionButtons" - an optional field. If absent or null, then no action buttons are
    //     shown. If present and non-null, it must be an array of objects each of which has fields
    //     "label" (a string giving the text to display), and "action" (a function to call when
    //     the button is clicked).
    //   * "splitter" - an optional field. If absent or null then the splitter is not shown.
    //     if present and non-null then it is an object with the field "numberOfAnts", which
    //     tells how many ants are in the stack being split, and "onDone", which is a function
    //     that is passed a list of numbers (telling how many ants in each split stack) if the
    //     user chooses to go through with a split.
    //
    // Note: This CANNOT be reduced to JSON because it (potentially, if there are any buttons)
    // contains a function.
    //
    // Example:
    const uiControls = {
        "actionButtons": [
            {
                "label": "Do Nothing",
                "action": function() {
                    playerActionSelections[0] = {name: "None"};
                }
            },
        ],
        "splitter": {
            "numberOfAnts": 3,
            "onDone": splits => {},
        },
    }


    // AnimationState
    //
    // This is the type of the global variable that keeps track of the current state when we are performing
    // an animation. (It will be null when we are NOT performing one.)
    //
    // It is an object containing the following fields:
    //   * scheduledTimeout -- the handle used to cancel the currently-pending timeout OR null if there is no
    //          currently-pending timeout. Always update this when calling setTimeout() for animation.
    //   * colonySelections -- an array of ColonySelection objects (see dataStructures.js) giving
    //          the choices of what actions all the ants and colonies want to take.
    //   * stage -- set to 0 initially, it will range up to 12 as we step through the steps of the animation
    //   * substage -- set to one of "Before", "Interacting", or "After". Stage 0 will only have "After"; all
    //          the other stages will run through the substages in order.
    //   * interactions -- this is an array of interactions objects (see dataStrucures.js). After
    //          first animating each stage, a new entry will be added, so the interactions for stage x are at
    //          interactions[x-1].
    //   * randomNumberSource -- a sequence that generates random numbers to use during the animation. It
    //          is a function which can be called to return a number such that 0 <= x < 1. The series of
    //          numbers returned will be the same for the randomNumberSource passed to each machine that is
    //          executing the animation.
    //   * animateSpeed - a number that controls the speed of the animation. 100 is "pretty darn slow", 1 is
    //          "as fast as possible". Must be a positive integer.
    //   * progression - set to one of "Animating" (running through at normal speed, to pause after 12:After),
    //          "Rushing" (running through at full speed, to move on to the next turn once we hit the
    //          end), "Replaying" (running through at 1/3 speed, to pause after 12:After), or "Paused"
    //          (running through at 1/3 speed until the next "After" substage, then staying there).


}
