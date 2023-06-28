/*
 * This file contains functions and data strutctures that are useful for animating things moving
 * step by step.
 */

//
// Design note: We want to play out the moves and things simultaneously over various different colonies
// of ants. So we need to somehow spread the actions out over time. Someday maybe we'll build a smooth
// animation, but for the moment we're just going to have the jump from hex to hex. So we're going to
// have a series of (simultaneous) steps. There's a problem though... the things that ants are doing
// (mostly moving) take different numbers of steps!
//
// Mostly though, they take 1 step, 2 steps, 3 steps, or maybe 4 steps. So what we'll do is treat
// everything as happening in a total of 12 different stages. Stage 0 will be how we started the
// turn, then we'll animate stage 1, stage 2, stage 3, and so forth up until stage 12 represents the
// final state of things.
//
// So we need the ability to apply a certain stage to the GameState.
//


/*
 * This performs applyActionStage in the case where the action is a Move action. See
 * that function for the requirements.
 *
 * Design Note: That formula for indexOfStep looks simple, but it took me some time
 * to confirm that it behaves as desired: always returns the last slot in the steps
 * array when steps is 0, spreads it out nicely otherwise.
 */
function applyMoveAction(gameState, colonyNumber, antNumber, action, stage) {
    const indexOfStep = Math.ceil(action.steps.length * (stage / 12)) - 1; // spread the steps out over our 12-step timeline
    if (indexOfStep !== 0) { // if index === 0 then we don't need to do any update anyway
        gameState.colonies[colonyNumber].ants[antNumber].location = action.steps[indexOfStep];
    }
}


/*
 * This performs applyActionStage in the case where the action is a Dig action. See
 * that function for the requirements.
 */
function applyDigAction(gameState, colonyNumber, antNumber, action, stage) {
    const coord = action.location;
    // --- Move the ant if we're past stage 3 ---
    if (stage > 3) {
        gameState.colonies[colonyNumber].ants[antNumber].location = coord; // move the ant
    }
    // --- Update the tile at stage 12 ---
    if (stage === 12) {
        let newTerrainType;
        if (action.whatToDig === "Tunnel") {
            newTerrainType = 4;
        } else if (action.whatToDig === "Chamber") {
            newTerrainType = 5;
        } else {
            throw Error(`Invalid value for whatToDig: ${action.whatToDig}`);
        }
        gameState.terrainGrid[coord[1]][coord[0]] = newTerrainType; // change the terrain
    }
}



/*
 * This modifies the gameState it is given to enact a certain stage of a certain ant's action.
 *
 * The gameState variable contains a gameState which should be modified (if necessary). The
 * colonyNumber and antNumber specify which ant is being moved. The action parameter tells
 * what action that ant is taking and the stage parameter (always a number 1 through 12) tells
 * what stage of the process should be drawn.
 *
 * Nothing much is guaranteed about the gameState, but we ARE guaranteed that the ant in
 * question is in its initial position (before performing any of the action). So all we need
 * to do is to apply stage/12 of the desired action.
 *
 * For movement actions, we divide it by 12 and apply the appropriate fraction of the movement.
 * For many other actions we don't show the results until stage 12.
 */
function applyActionStage(gameState, colonyNumber, antNumber, action, stage) {
    if (action.name === "None") {
        // nothing to do for an action of "None".
    } else if (action.name === "Move") {
        applyMoveAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "LayEgg") {
        // do nothing... laying an egg doesn't work yet. FIXME: Make it work someday!
    } else if (action.name === "Dig") {
        applyDigAction(gameState, colonyNumber, antNumber, action, stage);
    } else {
        throw Error(`Invalid action: ${action.name}`);
    }
}


/*
 * This function is passed the following fields:
 *   * startGameState - a GameState (see dataStructures.js) which contains the state of the game
 *       BEFORE any actions were taken.
 *   * colonySelections - an array of ColonySelections (see dataStructures.js), one for each colony
 *       which contains the intended actions for the ants of that colony.
 *   * stage - the stage to render. Must be a number 0 through 12 (inclusive).
 *
 * It returns a new GameState which is a copy of the original that has been modified to perform the
 * indicated stage of the requested actions. (Except that, as a special case, for stage 0 it will
 * return the original itself since stage 0 always has no changes.)
 */
function stagedGameState(startGameState, colonySelections, stage) {
    if (stage === 0) {
        return startGameState;
    } else {
        let newGameState = structuredClone(startGameState);
        colonySelections.forEach((colonySelection, colonyNumber) => {
            colonySelection.actionSelections.forEach((action, antNumber) => {
                applyActionStage(newGameState, colonyNumber, antNumber, action, stage)
            })
        });
        return newGameState;
    }
}


/*
 * This is a key part of watching the turn happen.
 *
 * It gets called with an animationState which is an object containing these fields:
 *  * startGameState -- a GameState showing how things were BEFORE we begin moving
 *  * colonySelections -- the choices of what actions all the ants and colonies want to take
 *  * stage -- set to 0 initially, it will range up to 12 as we step through the steps of the animation
 *
 * This function sets the global gameState to a single stage of the animation (which one depends on the
 * stage field of the animationState). Then it increments stage. THEN it triggers itself to run again
 * (showing the NEXT step...) after a few moments UNLESS we've shown the final stage of the animation,
 * in which cases it moves into the state for entering the next turn's actions.
 */
function animate(animationState) {
    gameState = stagedGameState(animationState.startGameState, animationState.colonySelections, animationState.stage);
    render();
    animationState.stage += 1;
    if (animationState.stage <= 12) {
        setTimeout(animate, 500, animationState);
    } else {
        sweepScreen("#FFFFFF"); // show blank screen briefly
        setTimeout(
            function() {
                startNewTurn();
                render();
            },
            200 // flash white for only 200 ms
        );
    }
}
