/*
 * Contains definitions of data structures we will use.
 */


// TerrainId:
//
// A TerrainId is an integer that indicates a particular kind of background. The allowed
// values are:
//   0: Bedrock
//   1: Dirt
//   2: Stone
//   3: Sky
//
// Example:
//  let terrainId = 1;



// TerrainGrid:
//
// A TerrainGrid defines what types the cells are within the entire game board.
//
// It is stored as a 2D array of TerrainIds. The outer list contains a list for each row, starting
// from the top. Each row is always the same length. The odd-numbered rows are offset 1/2 a cell
// to the right (because it's a hex grid, not a square grid).
//
// Example:
//  let startingGrid = [
//      [3, 3, 3, 3, 3, 3],
//       [2, 1, 1, 1, 2, 1],
//      [2, 2, 1, 1, 1, 1],
//       [2, 2, 1, 1, 1, 2],
//      [0, 0, 0, 0, 0, 0],
//  ];
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
//  let location = [2,3];


// AntState:
//
// An AntState tells the current state of an ant BETWEEN turns.
//
// It is an object,
//
// Example:
//  let antState = {
//      "facing": 1,
//      "location": [2, 3]
//  };



// GameState:
//
// A GameState shows the current state of the game (in between turns, not while actually ENTERING a
// turn).
//
// It is an object with a few fields:
//    terrainGrid: a TerrainGrid
//    ants: a list of AntState
//
// Example:
//  let currentGameState = {
//      "terrainGrid": [
//          [3, 3, 3, 3, 3, 3],
//           [2, 1, 1, 1, 2, 1],
//          [2, 2, 1, 1, 1, 1],
//           [2, 2, 1, 1, 1, 2],
//          [0, 0, 0, 0, 0, 0],
//      ],
//      "ants": [
//          {
//              "location": [2, 1]
//          },
//          {
//              "location": [4, 3]
//          }
//      ]
//  };


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
//
// Examples:
//  let action1 = {
//      "name": "None"
//  };
//  let action2 = {
//      "name": "Move",
//      "destination": [4, 4]
//  };




// ActionSelection:
//
// A ActionSelection is for recording all moves made in a turn.
//
// It is a list containing Actions. The list of actions must be exactly the same length as the list of
// ants in the GameState that goes with it.
//
// Example:
//  let actionSelection = [
//      {
//          "name": "None"
//      },
//      {
//          "name": "Move",
//          "destination": [2, 3]
//      }
//  ];


// MoveLocations:
//
// This describes all the places an ant can go.
//
// It is a list of Locations. If the ant is allowed to stay in place it will include the ant's
// current location.
//
// Example:
//  let moveLocations = [
//      [1, 1],
//      [2, 1],
//      [2, 2],
//      [3, 1],
//      [3, 2],
//  ];
