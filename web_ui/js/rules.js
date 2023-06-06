/*
 * Contains code to enforce the rules of the game.
 */

// This updates after a set of moves has been selected. It is passed a GameState (see dataStructures.js)
// and a MoveSelection. It returns the new GameState.
//
function applyRules(gameState, actionSelection) {
    // As a placeholder, we'll return the gameState unmodified
    return gameState;
}

// This finds the list of allowed locations an ant can move to. It is passed a GameState (see
// dataStructures.js) and an integer specifying which ant we want the moves of. It returns a
// MoveLocations.
function possibleMoves(gameState, antNumber) {
    // As a placeholder, we'll return the same location we are already on -- and nothing else.
    return [ gameState.ants[antNumber].location ];
}
