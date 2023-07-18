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
        let facing;
        if (indexOfStep ===0) {
            facing = getNewFacing(gameState.colonies[colonyNumber].ants[antNumber].location, action.steps[indexOfStep]);
        } else {
            facing = getNewFacing(action.steps[indexOfStep-1], action.steps[indexOfStep]);
        }
        gameState.colonies[colonyNumber].ants[antNumber].facing = facing;
        gameState.colonies[colonyNumber].ants[antNumber].location = action.steps[indexOfStep];
    }
}

/*
 * This performs applyActionStage in the case where the action is a Defend action. See
 * that function for the requirements. The ant stack will attack all enemy adjacent or
 * overlapping ant stacks each stage.
 */
function applyDefendAction(gameState, colonyNumber, antNumber, action, stage) {
}

function applyLayEggAction(gameState, colonyNumber, antNumber, action, stage) {
    if (stage >= 11){
        let eggStack = getEggAt(gameState.colonies[colonyNumber].eggs, gameState.colonies[colonyNumber].ants[antNumber].location);
        if (eggStack === null){
            const eggLoc = gameState.colonies[colonyNumber].ants[antNumber].location;
            eggStack = {"numberOfEggs": 1, "location": eggLoc, "daysToHatch": Rules.TURNS_TO_HATCH};
            gameState.colonies[playerColony].eggs.push(eggStack);
        } else {
            if (eggStack.numberOfEggs <= Rules.MAX_EGGS){
                eggStack.numberOfEggs += 1;
            }
        }
    }
}

/*
 * This performs applyActionStage in the case where the action is a Dig action. See
 * that function for the requirements.
 *
 * Dug things appear in stage 11.
 */
function applyDigAction(gameState, colonyNumber, antNumber, action, stage) {
    const coord = action.location;
    // --- Move the ant if we're past stage 3 ---
    if (stage > 3) {
        gameState.colonies[colonyNumber].ants[antNumber].location = coord; // move the ant
    }
    // --- Update the tile if at stage 11 or more  ---
    if (stage >= 11) {
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
    } else if (action.name === "Defend") {
        applyDefendAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "LayEgg") {
        applyLayEggAction(gameState, colonyNumber, antNumber, action, stage);
    } else if (action.name === "Dig") {
        applyDigAction(gameState, colonyNumber, antNumber, action, stage);
    } else {
        throw Error(`Invalid action: ${action.name}`);
    }
}


/*
 * This function is passed an animationState.
 *
 * It returns a new GameState which is a copy of the startOfTurnGameState that has been modified
 * to perform the animationState's current stage. When the substage is "Before" or "Interacting"
 * it returns the game state taking into account interactions up to that stage but NOT the
 * interactions from that stage. When the substage is "After" it takes into account the interactions
 * from that stage as well. (It does NOT show the interactions in the "Interacting" stage, because
 * that's not part of the GameState.)
 */
function gameStateForStage(animationState) {
    // --- Start with a copy of the startOfTurnGameState ---
    let newGameState = structuredClone(startOfTurnGameState);

    // --- Move the pieces ---
    animationState.colonySelections.forEach((colonySelection, colonyNumber) => {
        colonySelection.actionSelections.forEach((action, antNumber) => {
            applyActionStage(newGameState, colonyNumber, antNumber, action, animationState.stage)
        })
    });

    // --- Apply interactions ---
    const numInteractionsToApply = animationState.substage === "After" ? animationState.stage : animationState.stage - 1;
    for (let stageNum = 0; stageNum < numInteractionsToApply; stageNum++) {
        animationState.interactions[stageNum].forEach(i => {
            newGameState.colonies[i.colonyNumber].ants[i.antNumber].numberOfAnts -= i.numberLost;
        });
    }

    // --- Return it ---
    return newGameState;
}


/*
 * This handles a fight between two different ant stacks.
 *
 * It takes as input two ants (known to be of different colonies) and a
 * randomNumberSource. It uses the randomNumberSource to generate random
 * numbers as needed, and it returns an array of two numbers, which are
 * the number of ants lost from each ant stack (in order). Either (or both)
 * number can be zero. The numberLost values are returned in the same order
 * as the two ants that were passed.
 */
function fight(ant0, ant1, randomNumberSource) {
    let numberLost0 = 0;
    for (let i = 0; i < ant1.numberOfAnts; i++) {
        if (numberLost0 < ant0.numberOfAnts) {
            const chanceToKill = 1 / 3;
            if (randomNumberSource() < chanceToKill) {
                numberLost0 += 1;
            }
        }
    }

    let numberLost1 = 0;
    for (let i = 0; i < ant0.numberOfAnts; i++) {
        if (numberLost1 < ant1.numberOfAnts) {
            const chanceToKill = 1 / 3;
            if (randomNumberSource() < chanceToKill) {
                numberLost1 += 1;
            }
        }
    }

    return [numberLost0, numberLost1];
}


/*
 * This is where unplanned things like interactions between colonies occur.
 *
 * It gets called after each stage 1..12. It is passed the displayedGameState for that
 * stage PRIOR to applying any interactions, and it returns the list of interactions to
 * apply. It is allowed (encouraged!) to use the randomNumberSource in animationState
 * to determine outcomes. (WARNING: When we allow running it backward, this way of using
 * the randomNumberSource will need to change.
 */
function interactionsForStage(displayedGameState, animationState) {
    const result = []; // an array of interactions
    const colonies = displayedGameState.colonies;

    // Let's compare every pair of colonies
    for (let someColonyNum = 0; someColonyNum < colonies.length; someColonyNum++) {
        const someColony = colonies[someColonyNum];
        const someAnts = someColony.ants;
        for (let otherColonyNum = someColonyNum + 1; otherColonyNum < colonies.length; otherColonyNum++) {
            const otherColony = colonies[otherColonyNum];
            const otherAnts = otherColony.ants;
            // at this point we have two different colonies, each with a list of ants

            someAnts.forEach((someAnt, someAntNum) => {
                otherAnts.forEach((otherAnt, otherAntNum) => {
                    // we reach this line once for each pair of enemy ants
                    if (coordAdjacent(someAnt.location, otherAnt.location)) {
                        const someAntAction = animationState.colonySelections[someColonyNum].actionSelections[someAntNum];
                        const otherAntAction = animationState.colonySelections[otherColonyNum].actionSelections[otherAntNum];
                        const someAntAggressive = someAntAction.name === "Defend";
                        const otherAntAggressive = otherAntAction.name === "Defend";
                        if (someAntAggressive || otherAntAggressive) {
                            // at this point we have 2 ants... let them fight!!
                            const numbersLost = fight(someAnt, otherAnt, animationState.randomNumberSource);
                            result.push( {colonyNumber: someColonyNum, antNumber: someAntNum, numberLost: numbersLost[0]} );
                            result.push( {colonyNumber: otherColonyNum, antNumber: otherAntNum, numberLost: numbersLost[1]} );
                        }
                    }
                });
            });

        }
    }

    return result;
}


/*
 * This is called during animation to display the interactions (battles). It is passed a
 * single stage's list of interactions to be displayed. It can read displayedGameState
 * for information. It should not modify it -- the interactions are not part of the
 * game state.
 *
 * For now, we're using indicated hexes to show the battles, but we'll eventually want
 * better graphics.
 */
function showInteractions(interactions) {
    interactions.forEach(i => {
        const coord = displayedGameState.colonies[i.colonyNumber].ants[i.antNumber].location;
        indicatedHexes.push(
            {
                location: coord,
                color: "#FF0000",
            }
        );
    });
}


/*
 * This is passed a GameState, and it modifies that GameState by feeding food to ants.
 */
function eatFood(gameState) {
    gameState.foodItems.forEach(foodItem => {
        const coord = foodItem.location;
        let antsThere = getAllAntNumsAt(gameState, coord);
        if (antsThere.length === 1) { // only eat if there is EXACTLY one ant stack there
            const colonyNumber = antsThere[0][0];
            const antNumber = antsThere[0][1];
            const eatingAnt = gameState.colonies[colonyNumber].ants[antNumber];
            const maxFoodAnAntCanHold = 2; // DESIGN NOTE: Later we might make this vary.
            const maxFoodStackCanHold = maxFoodAnAntCanHold * eatingAnt.numberOfAnts;
            const foodEaten = Math.min(foodItem.foodValue, Math.max(maxFoodStackCanHold - eatingAnt.foodHeld, 0));
            if (foodEaten > 0) {
                foodItem.foodValue = foodItem.foodValue - foodEaten;
                eatingAnt.foodHeld = eatingAnt.foodHeld + foodEaten;
            }
        }
    });
}


/*
 * This is passed a GameState, and it modifies that GameState by "delivering" food from ants that have
 * carried it "home". For now, the rule is that food is credited to the colony if the ant carrying it
 * is (1) in a space with a larva of the same colony, or (2) is within 1 step of a queen of the same
 * colony.
 */
function deliverFood(gameState) {
    gameState.colonies.forEach((colony, colonyNum) => {
        colony.ants.forEach(ant => {
            if (ant.foodHeld > 0) {
                const antLocation = ant.location;
                let shouldDeliver = false; // by default... let's see if that changes...

                // check for being in a space with a larva
                const larvaHere = getAntStatesAt(colony.ants, antLocation).filter(ant => ant.cast === "Larva");
                if (larvaHere.length > 0) {
                    shouldDeliver = true;
                }

                // check for being next to a queen
                colony.ants.filter(ant => ant.cast === "Queen").forEach(queen => {
                    if (coordAdjacent(queen.location, antLocation)) {
                        shouldDeliver = true;
                    }
                });

                // if we should deliver, then do so
                if (shouldDeliver) {
                    colony.foodSupply += ant.foodHeld;
                    ant.foodHeld = 0;
                }
            }
        });
    });
}


/*
 * This is passed a GameState, and it modifies that GameState by removing any foodItems that have a zero
 * foodValue.
 */
function clearAwayFood(gameState) {
    gameState.foodItems = gameState.foodItems.filter(foodItem => foodItem.foodValue > 0);
}


/*
 * This constant is used with distributionOfFood to determine the chance each turn of creating
 * food in each eligible location. This is an overall multiplier that is multiplied by the
 * values in distributionOfFood to produce the actual outcome.
 */
const chanceToFindFood = 0.001;

/*
 * This constant is an array of the same length as valid TerrainIds (see dataStructures.js).
 * For each TerrainId, it contains an array giving the relative probabilities that a FoodItem of
 * various sizes will be created. The sizes are one more than the position in the array, so an
 * array of [3, 3, 0, 3] means that for each cell of the terrain type there are 3 chances to
 *
 */
const distributionOfFood = [
    [],                    //   0: Bedrock
    [2, 1, 1],             //   1: Dirt
    [],                    //   2: Stone
    [],                    //   3: Sky
    [2, 1, 0],             //   4: Dirt with Tunnel
    [],                    //   5: Dirt with Chamber
    [3, 3, 3, 1, 0, 0, 1], //   6: Surface
];


/*
 * This is passed a GameState and a RandomNumberSource, and it modifies that GameState by randomly
 * creating new food particles in some locations. Note that this has to enforce the rule that
 * there is no more than one food item in any given location.
 */
function createNewFood(gameState, randomNumberSource) {
    gameState.terrainGrid.forEach((terrainRow, y) => {
        terrainRow.forEach((terrainId, x) => {
            // For each (x,y) location:
            const coord = [x,y];
            const distributionArray = distributionOfFood[terrainId];
            if (distributionArray !== undefined && distributionArray.length > 0) {
                // OK, there might be a chance of creating a FoodItem here
                if (gameState.foodItems.every(foodItem => !coordEqual(foodItem.location, coord))) { // if there's no food here
                    if (getAllAntNumsAt(gameState, coord).length === 0) { // only if there are no ants present
                        // try each food size (we'll quit if we create one)
                        for (let foodValue=1; foodValue <= distributionArray.length; foodValue++) {
                            const prob = distributionArray[foodValue - 1] * chanceToFindFood;
                            if (randomNumberSource() < prob) {
                                // Yes! We should create this food item!
                                const newFoodItem = {
                                    appearance: "BasicParticle",
                                    location: coord,
                                    foodValue: foodValue,
                                };
                                gameState.foodItems.push(newFoodItem);
                                break; // quit looping through food sizes
                            }
                        }
                    }
                }
            }
        });
    });
}


/*
 * This is passed a GameState and a RandomNumberSource, and it modifies that GameState by processing
 * one turn of ants interacting with the food. Ants that aren't full eat food they are on; ants that
 * are "home" deliver the food they are carrying; empty food disappears; and new food randomly appears.
 */
function processFood(gameState, randomNumberSource) {
    eatFood(gameState);
    deliverFood(gameState);
    clearAwayFood(gameState);
    createNewFood(gameState, randomNumberSource);
}


/*
 * This is a key part of watching the turn happen.
 *
 * It gets called with an animationState which is an object containing these fields:
 *  * colonySelections -- an array of ColonySelection objects (see dataStructures.js) giving
 *        the choices of what actions all the ants and colonies want to take.
 *  * stage -- set to 0 initially, it will range up to 12 as we step through the steps of the animation
 *  * substage -- set to one of "Before", "Interacting", or "After". Stage 0 will only have "After"; all
 *        the other stages will run through the substages in order.
 *  * interactions -- this is an array of interactions objects (see dataStrucures.js). After
 *        first animating each stage, a new entry will be added, so the interactions for stage x are at
 *        interactions[x-1].
 *  * randomNumberSource -- a sequence that generates random numbers to use during the animation. It
 *        is a function which can be called to return a number such that 0 <= x < 1. The series of
 *        numbers returned will be the same for the randomNumberSource passed to each machine that is
 *        executing the animation.
 * * animateSpeed - a number that controls the speed of the animation. 100 is "pretty darn slow", 1 is
 *        "as fast as possible". Must be a positive integer.
 *
 * This function sets the global displayedGameState to a single stage of the animation (which one depends
 * on the stage field of the animationState). Then it increments stage. THEN it triggers itself to run again
 * (showing the NEXT step...) after a few moments UNLESS we've shown the final stage of the animation,
 * in which cases it advances to the next turn and moves into the state for entering the next turn's actions.
 */
function animate(animationState) {
    if (animationState.stage === 0) {
        displayedGameState = structuredClone(startOfTurnGameState);
        render();
        animationState.stage += 1;
        animationState.substage = "Before";
        setTimeout(animate, 2 * animationState.animateSpeed, animationState);
    } else if (animationState.stage <= 12) {
        if (animationState.substage === "Before") {
            displayedGameState = gameStateForStage(animationState);
            render();
            animationState.substage = "Interacting";
            setTimeout(animate, 2 * animationState.animateSpeed, animationState);
        } else if (animationState.substage === "Interacting") {
            // NOTE: if we're always moving forward, then displayedGameState is already correct
            const newInteractions = interactionsForStage(displayedGameState, animationState);
            animationState.interactions.push(newInteractions);
            showInteractions(newInteractions);
            render();
            animationState.substage = "After";
            setTimeout(animate, 2 * animationState.animateSpeed, animationState);
        } else if (animationState.substage === "After") {
            indicatedHexes.length = 0; // remove interactions
            displayedGameState = gameStateForStage(animationState);
            if (animationState.stage === 12) {
                // After stage 12 is when ants process the food
                processFood(displayedGameState, animationState.randomNumberSource);
            }
            render();
            animationState.stage += 1;
            animationState.substage = "Before";
            setTimeout(animate, 2 * animationState.animateSpeed, animationState);
        } else {
            throw Error(`Invalid animationState.substage of '${animationState.substage}'.`);
        }
    } else {
        sweepScreen("#FFFFFF"); // show blank screen briefly
        setTimeout(
            function() {
                // --- make what we're displaying be the new turn's state ---
                startOfTurnGameState = displayedGameState; // advance to the new turn!

                // --- merge any ant stacks ---
                // Merge any stacks that have joined together
                startOfTurnGameState.colonies.forEach(colony => {
                    colony.ants = mergeAnts(colony.ants);
                });

                // --- base the new displayedGameState on the updated startOfTurnGameState ---
                displayedGameState = structuredClone(startOfTurnGameState);

                // --- start the new turn ---
                startNewTurn();
                render();
            },
            200 // flash white for only 200 ms
        );
    }
}
