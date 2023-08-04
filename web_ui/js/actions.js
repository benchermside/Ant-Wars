/*
 * Contains code about actions, like applying an action to a GameState or reverting an action.
 */


/*
 * Because new ants can be created by splitting stacks, it's actually non-trivial to obtain the ant we started
 * from at the beginning of the turn. This function encapsulates that behavior so it can be used where needed.
 */
function getStartOfTurnAnt(startOfTurnGameState, colonyNumber, antNumber) {
    const startOfTurnAnts = startOfTurnGameState.colonies[colonyNumber].ants;
    const isNewAnt = antNumber >= startOfTurnAnts.length; // whether this ant was created during the turn
    if (isNewAnt) {
        const newAntOrigin = newAntOrigins[antNumber - startOfTurnAnts.length];
        if (newAntOrigin.source === "Split") {
            // CASE 1: Deal with Ant Created By a Split
            return startOfTurnAnts[newAntOrigin.antNumber];
        } else if (newAntOrigin.source === "Matured") {
            throw Error(`Should not be able to command a newly-matured ant.`);
        } else {
            throw Error(`Unsupported value for newAntOrigin.source: '${newAntOrigin.source}'`);
        }
    } else {
        return startOfTurnGameState.colonies[colonyNumber].ants[antNumber];
    }
}


/* Applies a None action. */
function applyNoneAction(gameState, colonyNumber, antNumber, action, stage) {
    // Nothing to do
}

/* Reverts a None action. */
function revertNoneAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    // Nothing to do
}


/*
 * Applies a Movelike action(currently move or attack).
 *
 * Design Note: That formula for indexOfStep looks simple, but it took me some time
 * to confirm that it behaves as desired: returns -1 if we have stage of 0, always
 * returns the last slot in the steps array when steps is 12, spreads it out nicely
 * over the steps array for anything in between.
 */
function applyMovelikeAction(gameState, colonyNumber, antNumber, action, stage) {
    if (stage > 0) {
        const indexOfStep = Math.ceil(action.steps.length * (stage / 12)) - 1; // spread the steps out over our 12-step timeline
        const displayedAnt = gameState.colonies[colonyNumber].ants[antNumber]; // the one we'll change
        const newFacing = indexOfStep === 0
            ? displayedAnt.facing
            : getNewFacing(action.steps[indexOfStep - 1], action.steps[indexOfStep]);

        // make the changes
        displayedAnt.facing = newFacing;
        displayedAnt.location = action.steps[indexOfStep];
    }
}

/* Reverts a Move action. */
function revertMoveAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    // put the ant back where it started from
    const antToModify = gameState.colonies[colonyNumber].ants[antNumber];
    const startOfTurnAnt = getStartOfTurnAnt(startOfTurnGameState, colonyNumber, antNumber);
    antToModify.location = startOfTurnAnt.location;
    antToModify.facing = startOfTurnAnt.facing;
}

/*
 * Applies a Move action.
 *
 */
function applyMoveAction(gameState, colonyNumber, antNumber, action, stage) {
    return applyMovelikeAction(gameState, colonyNumber, antNumber, action, stage);
}

/*
 * apply attack action
 */
function applyAttackAction(gameState, colonyNumber, antNumber, action, stage) {
    return applyMovelikeAction(gameState, colonyNumber, antNumber, action, stage);
}

/*
 * reverts attack action
 */
function revertAttackAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    // put the ant back where it started from
    const antToModify = gameState.colonies[colonyNumber].ants[antNumber];
    const startOfTurnAnt = getStartOfTurnAnt(startOfTurnGameState, colonyNumber, antNumber);
    antToModify.location = startOfTurnAnt.location;
    antToModify.facing = startOfTurnAnt.facing;
}

/* Applies a Defend action. */
function applyDefendAction(gameState, colonyNumber, antNumber, action, stage) {
    // Nothing visual to do
}

/* Reverts a Defend action. */
function revertDefendAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    // Nothing visual we need to do
}



/* Applies a LayEgg action. */
function applyLayEggAction(gameState, colonyNumber, antNumber, action, stage) {
    if (stage >= 11) {
        const eggLoc = gameState.colonies[colonyNumber].ants[antNumber].location;
        let eggStack = getEggAt(gameState.colonies[playerColony].eggs, eggLoc);
        if(eggStack === null) {
            eggStack = {"numberOfEggs": 1, "location": eggLoc, "daysToHatch": rules.TURNS_TO_HATCH};
            gameState.colonies[playerColony].eggs.push(eggStack);
        } else {
            if (eggStack.numberOfEggs <= rules.MAX_EGGS) { // laying an egg when we're already at the max does nothing
                eggStack.numberOfEggs += 1;
            }
        }
        gameState.colonies[colonyNumber].foodSupply -= rules.costs.layEggCost;
    }
}

/* Reverts a LayEgg action. */
function revertLayEggAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    const startOfTurnAnt = getStartOfTurnAnt(startOfTurnGameState, colonyNumber, antNumber);
    const queenLocation = startOfTurnAnt.location;
    const eggs = gameState.colonies[colonyNumber].eggs;
    const thisEgg = getEggAt(eggs, queenLocation);
    if (thisEgg.numberOfEggs > 1) {
        thisEgg.numberOfEggs -= 1;
    } else {
        // this was the ONLY egg, so we'll remove the whole egg entry
        gameState.colonies[colonyNumber].eggs = eggs.filter(egg => !coordEqual(egg.location, queenLocation));
    }
    gameState.colonies[colonyNumber].foodSupply += rules.costs.layEggCost;
}



/* Applies a Dig action. */
function applyDigAction(gameState, colonyNumber, antNumber, action, stage) {
    const loc = action.location;
    const displayedAnt = gameState.colonies[colonyNumber].ants[antNumber];
    // --- Move the ant if we're past stage 3 ---
    if (stage > 3) {
        // Move the ant
        const oldLoc = displayedAnt.location;
        displayedAnt.location = loc;
        displayedAnt.facing = getNewFacing(oldLoc, loc);
    }

    // --- Update the tile if at stage 11 or more  ---
    if (stage >= 11) {
        // update the terrain grid
        let newTerrain;
        if (action.whatToDig === "Tunnel") {
            newTerrain = 4;
        } else if (action.whatToDig === "Chamber") {
            newTerrain = 5;
        } else {
            throw Error(`Invalid value for whatToDig: ${action.whatToDig}`);
        }
        gameState.terrainGrid[loc[1]][loc[0]] = newTerrain;

        // and charge a cost
        const cost = action.whatToDig === "Tunnel" ? rules.costs.digTunnelCost : rules.costs.digChamberCost;
        gameState.colonies[colonyNumber].foodSupply -= cost;
    }
}

/* Reverts a Dig action. */
function revertDigAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    // put the ant back where it started from
    const antToModify = gameState.colonies[colonyNumber].ants[antNumber];
    const startOfTurnAnt = getStartOfTurnAnt(startOfTurnGameState, colonyNumber, antNumber);
    antToModify.location = startOfTurnAnt.location;
    // put the terrainGrid back as it was
    const loc = action.location;
    gameState.terrainGrid[loc[1]][loc[0]] = startOfTurnGameState.terrainGrid[loc[1]][loc[0]];
    // put the cost back as it was
    const cost = action.whatToDig === "Tunnel" ? rules.costs.digTunnelCost : rules.costs.digChamberCost;
    gameState.colonies[colonyNumber].foodSupply += cost;
}



/* Applies a Mature action. */
function applyMatureAction(gameState, colonyNumber, antNumber, action, stage) {
    if (stage === 12) {
        // --- create the extra ant ---
        const colony = gameState.colonies[colonyNumber];
        const larvaAnt = colony.ants[antNumber];
        const newAnt = {
            "cast": action.cast,
            "facing": 1, // the default way everything faces
            "location": larvaAnt.location,
            "numberOfAnts": larvaAnt.numberOfAnts,
            "foodHeld": 0,
        };
        colony.ants.push(newAnt);
        const newAntOrigin = {
            "source": "Matured",
            "antNumber": antNumber,
        };
        newAntOrigins.push(newAntOrigin);

        // --- charge a cost ---
        const cost = larvaAnt.numberOfAnts * rules.costs.hatchCost[action.cast];
        gameState.colonies[colonyNumber].foodSupply -= cost;

        // --- remove the larva ---
        larvaAnt.numberOfAnts = 0; // shrink the number of larva ants to 0
    }
}

/* Reverts a Mature action. */
function revertMatureAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    // --- put back the larva ---
    const colony = gameState.colonies[colonyNumber];
    const larvaAnt = colony.ants[antNumber];
    const startOfTurnAnt = getStartOfTurnAnt(startOfTurnGameState, colonyNumber, antNumber);
    larvaAnt.numberOfAnts = startOfTurnAnt.numberOfAnts; // grow the number of larva ants

    // --- locate the newAntOrigin ---
    const newAntOriginIdx = newAntOrigins.findIndex(
        newAntSource => newAntSource.source === "Matured" && newAntSource.antNumber === antNumber
    );
    if (newAntOriginIdx === -1) {
        throw Error(`Reverting a MatureAction but there is no corresponding newAntSource.`);
    }

    // --- remove the newAntOrigin and also the new ant ---
    newAntOrigins.splice(newAntOriginIdx, 1);
    const startOfTurnAntCount = startOfTurnGameState.colonies[colonyNumber].ants.length;
    colony.ants.splice(startOfTurnAntCount + newAntOriginIdx, 1);

    // --- refund the cost ---
    const cost = larvaAnt.numberOfAnts * rules.costs.hatchCost[action.cast];
    gameState.colonies[colonyNumber].foodSupply += cost;
}

/* Applies a Split action, by creating smaller stacks and applying the actions to them. */
function applySplitAction(gameState, colonyNumber, antNumber, action, stage) {
    const origAnt = gameState.colonies[colonyNumber].ants[antNumber];
    const foodHeldByEachAnt = Math.floor(origAnt.foodHeld / origAnt.numberOfAnts);
    const foodRemainder = origAnt.foodHeld % origAnt.numberOfAnts;
    action.newStackCounts.forEach((numberOfAnts, stackNumber) => {
        if (stackNumber === 0) {
            origAnt.numberOfAnts = numberOfAnts;
            origAnt.foodHeld = foodHeldByEachAnt + (stackNumber < foodRemainder ? 1 : 0);
            applyAction(gameState, colonyNumber, antNumber, action.actions[stackNumber], stage);
        } else {
            const newAnt = {
                "cast": origAnt.cast,
                "facing": origAnt.facing,
                "location": origAnt.location,
                "numberOfAnts": numberOfAnts,
                "foodHeld": foodHeldByEachAnt + (stackNumber < foodRemainder ? 1 : 0),
            };
            const newAntOrigin = {
                "source": "Split",
                "antNumber": uiModeData.selectedAntNumber,
                "order": stackNumber,
            };
            gameState.colonies[colonyNumber].ants.push(newAnt);
            newAntOrigins.push(newAntOrigin);
            const newAntNumber = gameState.colonies[colonyNumber].ants.length - 1;
            applyAction(gameState, colonyNumber, newAntNumber, action.actions[stackNumber], stage);
        }
    });
}


/*
 * This modifies the gameState it is given to enact a certain stage of a certain ant's action.
 *
 * Inputs:
 *   * gameState: the GameState which will be modified. Nothing much is guaranteed about the
 *       gameState, but we ARE guaranteed that the ant taking the action is in its initial
 *       position (before performing any of the action).
 *   * colonyNumber: the colonyNumber of the ant that is enacting the action.
 *   * antNumber: the antNumber of the ant that is enacting the action.
 *   * action: the action being taken (or null)
 *   * stage: the stage (0 .. 12) of the turn to be rendered. This is optional, if omitted it
 *        defaults to 12 (end of turn).
 *
 * For movement actions, we divide it by 12 and apply the appropriate fraction of the movement.
 * For many other actions we don't show the results until some late stage like 11 or 12.
 *
 * Special detail: it ALSO may modify newAntOrigins (it does if any new ant is created). That's desired
 * when we're inputting moves, and it's probably not *technically* breaking anything when we're enacting
 * moves, but it is definitely a minor design flaw. What would be better? Should newAntOrigins be part
 * of the GameState or something? Or passed in to this?
 */
function applyAction(gameState, colonyNumber, antNumber, action, stage) {
    if (stage === undefined) {
        stage = 12; // stage is optional, defaulting to the end of turn (stage 12)
    }
    if (action === null) {
        // nothing to apply
    } else if (action.name === "None") {
        applyNoneAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "Move") {
        applyMoveAction(gameState, colonyNumber, antNumber, action, stage);
    } else if(action.name === "Attack") {
        applyAttackAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "Defend") {
        applyDefendAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "LayEgg") {
        applyLayEggAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "Dig") {
        applyDigAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "Mature") {
        applyMatureAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "Split") {
        applySplitAction(gameState, colonyNumber, antNumber, action, stage);
    } else {
        throw Error(`Unsupported action type, '${action.name}'`);
    }
}

/*
 * This modifies the gameState to revert an action that has been fully applied.
 *
 * Inputs:
 *   * gameState: the GameState which will be modified. This is a GameState that has definitely
 *        had stage 12 of the action applied to it. It will be modified to revert the effects
 *        of that action.
 *   * startOfTurnGameState: a GameState representing how things were at the beginning of the
 *        turn. This will NOT be modified -- it is read-only.
 *   * colonyNumber: the colonyNumber of the ant that enacted the action we want to revert.
 *   * antNumber: the antNumber of the ant that enacted the action we want to revert.
 *   * action: the action to be reverted (or null)
 */
function revertAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action) {
    if (action === null) {
        // nothing to revert
    } else if (action.name === "None") {
        revertNoneAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action);
    } else if (action.name === "Move") {
        revertMoveAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action);
    } else if (action.name === "Attack") {
        revertAttackAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action);
    } else if (action.name === "Defend") {
        revertDefendAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action);
    } else if (action.name === "LayEgg") {
        revertLayEggAction(gameState, startOfTurnGameState, colonyNumber, antNumber, action);
    } else if (action.name === "Dig") {
        revertDigAction(gameState, startOfTurnGameState, startOfTurnAnt, colonyNumber, antNumber, action);
    } else if (action.name === "Mature") {
        revertMatureAction(gameState, startOfTurnGameState, startOfTurnAnt, colonyNumber, antNumber, action);
    } else if (action.name === "Split") {
        throw Error(`The code doesn't support reverting a split.`);
    } else {
        throw Error(`Unsupported action type, '${action.name}'`);
    }
}
