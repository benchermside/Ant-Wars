/*
 * This file defines a type "UI Mode" and some instances of it. These control how the user interface
 * will behave when in a certain "mode" (such as "readyToEnterMoves" or "commandingAnAnt").
 */

// UIMode:
//
// A UIMode is a collection of functions that control the behavior of the UI while the user is
// doing something. For instance, in the middle of giving order to an ant the UI should behave
// differently than when selecting an ant or when just viewing.
//
// Every UIMode has a field named "enterMode". This must be a function with no arguments that
// will be invoked when we want to begin that mode. It should typically set any highlighting
// that is needed. The enterMode() function should NOT call render(), but whoever calls enterMode()
// will make sure it is called.
//
// Every UIMode has a field named "exitMode". This must be a function with no arguments that
// will be invoked when we are leaving that mode. It may clear out highlighting that was used
// for the mode. The exitMode() function should NOT call render(), but whoever calls exitMode()
// will make sure it is called.
//
// Every UIMode has a field named "onClickHex". This must be a function that is invoked whenever
// the user is in that mode and clicks on the map. It accepts a "coord" argument which is either
// null (if the user clicked off the map) or has the [x,y] grid coordinate of the hex that was
// clicked on. The function should take appropriate actions depending on what the user wants to
// do.
//
// Every UIMode has a field named "actionButtons". This must be a function that will be invoked
// to get the list of buttons to display for the user actions. Each button is an object that
// matches the specifications documented in the function "setActionButtons".
//
// Every UIMode has a field named "uiControls". This must be a function that will be invoked to
// find what temporary UI controls should be rendered over the canvas while in this mode. It
// will return a UIControls object (as defined in dataStructures.js). The most common use of
// this is to contain a field "actionButtons" listing the buttons to display.
//
// Some UI modes need to track additional information. This will be stored in the uiModeData
// global variable which is cleared out and re-created each time we change modes.


const watchingTurnHappen = {
    enterMode: function(uiModeData) {
        // --- Put the game state back to how it started ---
        displayedGameState = structuredClone(startOfTurnGameState);

        //reduce all turn to hatch eggs by 1; if any reach 0 put an action on the quuee???

        // --- Now call the animation function which will run for a few seconds, then exit the mode ---
        const animationState = {
            colonySelections: colonySelections,
            stage: 0,
            substage: "After",
            interactions: [],
            randomNumberSource: newRandomSequence(uiModeData.randomSeed),
            animateSpeed: 50,
        };
        uiModeData.animationState = animationState;
        sweepScreen("#000000"); // show blank screen briefly
        setTimeout(animate, 500, animationState); // then run the animation
    },

    exitMode: function(uiModeData) {
    },

    onClickHex: function(coord, uiModeData) {
        // If you click while watching the turn play out we'll assume you're in a hurry, and we'll just
        // speed up the rest of the animation.
        uiModeData.animationState.animateSpeed = 1;
    },

    actionButtons: function(uiModeData) {
        return [];
    },

    uiControls: function(uiModeData) {
        return {};
    }
};

/*
 * This is a uiMode which is used when the player is ready to begin entering the actions for
 * their colony. This is the starting mode when a player's turn begins, and in many ways is
 * the "default" mode.
 */
const readyToEnterMoves = {
    enterMode: function(uiModeData) {
        // Indicate the ants that still need to be moved`
        indicatedHexes.length = 0;
        playerActionSelections.forEach((actionSelection, antNumber) => {
            if (actionSelection === null) {
                const indication = {
                    location: displayedGameState.colonies[playerColony].ants[antNumber].location,
                    color: "#4D8BF066"
                };
                indicatedHexes.push(indication);
            }
        });
    },

    exitMode: function(uiModeData) {
        highlightedHex = null; // de-select the currently selected location (if any)
    },

    onClickHex: function(coord, uiModeData) {
        if (coord === null) { // if we clicked off the map
            if (highlightedHex === null) {
                // Nothing was selected, and we clicked off the map: nothing at all happens!
            } else {
                // Something was selected, and we clicked off the map: de-select the hex.
                // we are DE-selecting a hex
                highlightedHex = null;
                render();
            }
        } else { // if we clicked a hex
            const playerAnts = displayedGameState.colonies[playerColony].ants;
            let antNums = null;

            //if we have already selected ants at this hex only get ants AFTER the ones we have selected
            if (coordEqual(coord, highlightedHex) && (lastSelectedAntNum !== null)){
                console.log ("already selected an ant");
                antNums = getAntNumsAt(playerAnts, coord, lastSelectedAntNum + 1);
            } else {
                antNums = getAntNumsAt(playerAnts, coord);
            }

            if (coordEqual(coord, highlightedHex) && (antNums.length < 1))
            {
                // we clicked on the selected hex and have cycled through any ants on it ; just de-select it.
                highlightedHex = null;
                lastSelectedAntNum = null;
                render();
            } else {
                highlightedHex = coord;
                if (antNums.length > 0) {
                    lastSelectedAntNum = antNums[0];
                    const data = {
                        selectedAntNumber: lastSelectedAntNum,
                    };
                    changeUIMode("commandingAnAnt", data);
                }
                render();
            }
        }
    },

    actionButtons: function(uiModeData) {
        // If we've entered moves for ALL ants, enable the end-turn button
        const label = (movesHaveBeenSent
            ? "Alter Turn"
            : (playerActionSelections.every(action => action !== null))
                ? "End Turn"
                : "Skip Remaining Ants");
        return [
            {
                label: label,
                action: function() {
                    let turnHasEnded = false;
                    if (isHostServer) {
                        // --- is the host server ---
                        // --- copy over the actions we've entered & mark ready to end ---
                        colonySelections[playerColony].actionSelections = structuredClone(playerActionSelections);
                        colonySelections[playerColony].isReadyForEndOfTurn = true;

                        // --- Do end of turn if everyone is ready ---
                        turnHasEnded = hostDoEndOfTurnIfEveryoneIsReady();
                    } else {
                        // --- is NOT the host server ---
                        announceColonySelections(playerActionSelections);
                    }
                    movesHaveBeenSent = true;
                    if (!turnHasEnded) { // if we haven't ended the turn, go ahead and refresh to show the new button
                        changeUIMode("readyToEnterMoves");
                        render();
                    }
                },
            }
        ]
    },

    uiControls: function(uiModeData) {
        const label = (movesHaveBeenSent
            ? "Alter Turn"
            : (playerActionSelections.every(action => action !== null))
                ? "End Turn"
                : "Skip Remaining Ants");
        return {
            actionButtons: [{
                label: label,
                action: function() {
                    let turnHasEnded = false;
                    if (isHostServer) {
                        // --- is the host server ---
                        // --- copy over the actions we've entered & mark ready to end ---
                        colonySelections[playerColony].actionSelections = structuredClone(playerActionSelections);
                        colonySelections[playerColony].isReadyForEndOfTurn = true;

                        // --- Do end of turn if everyone is ready ---
                        turnHasEnded = hostDoEndOfTurnIfEveryoneIsReady();
                    } else {
                        // --- is NOT the host server ---
                        announceColonySelections(playerActionSelections);
                    }
                    movesHaveBeenSent = true;
                    if (!turnHasEnded) { // if we haven't ended the turn, go ahead and refresh to show the new button
                        changeUIMode("readyToEnterMoves");
                        render();
                    }
                },
            }]
        };
    },

};



/*
 * A function that just returns the list of action buttons (including their action code) for an
 * ant. Used within the commandingAnAnt mode.
 */
function commandingAnAntActionButtons(uiModeData) {
    const buttons = [];
    const selectedAntStartOfTurn = startOfTurnGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber];
    const selectedAntDisplayed = displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber];

    buttons.push({
        label: "Do Nothing",
        action: function() {
            // We decided to do nothing. Record that.
            setPlayerAction(uiModeData.selectedAntNumber, {name: "None"});
            // Now switch modes
            changeUIMode("readyToEnterMoves");
            render();
        },
    });

    if (selectedAntDisplayed.cast !== "Larva" && selectedAntDisplayed.numberOfAnts >= 2) {
        // FIXME: Known bug: if you try to split an already-split ant it breaks things, and there's no way to revert a split
        buttons.push({
            label: "Split Up",
            action: function() {
                // Until it changes, record the ant as doing nothing.
                setPlayerAction(uiModeData.selectedAntNumber, {name: "None"});
                // Now switch modes
                changeUIMode("splittingAntStack", {selectedAntNumber: uiModeData.selectedAntNumber});
                render();
            }
        });
    }

    if (selectedAntDisplayed.cast === "Queen") {
        // Queens can lay an egg if they're in a chamber
        const coord = selectedAntDisplayed.location;
        const terrain = startOfTurnGameState.terrainGrid[coord[1]][coord[0]];
        if (terrain === 5) {
            const eggStack = getEggAt(displayedGameState.colonies[playerColony].eggs, selectedAntDisplayed.location);
            if(eggStack === null || eggStack.numberOfEggs < rules.MAX_EGGS) {
                buttons.push({
                    label: "Lay Egg",
                    action: function() {
                        // We decided to lay an egg. Record that.
                        const action = {name: "LayEgg"};
                        setPlayerAction(uiModeData.selectedAntNumber, action);
                        applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, action);

                        // Now switch modes
                        changeUIMode("readyToEnterMoves");

                        // Re-render the screen
                        render();
                    },
                });
            }
        }
    }

    if (selectedAntDisplayed.cast !== "Larva") {
        const attackActions = possibleAttackActions(startOfTurnGameState, displayedGameState, playerColony, uiModeData.selectedAntNumber);
        if (attackActions.length > 0) {
            buttons.push({
                label: "Attack",
                action: function () {
                    const data = {
                        selectedAntNumber: uiModeData.selectedAntNumber,
                        attackActions: attackActions,
                    };
                    changeUIMode("selectingAttackDestination", data);
                    render();
                }
            });
        }
    }

    if (selectedAntDisplayed.cast !== "Larva") {
        buttons.push({
            label: "Defend",
            action: function() {
                // We decided to have this ant defend. Record that.
                const action = {name: "Defend"};
                setPlayerAction(uiModeData.selectedAntNumber, action);
                applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, action);
                // Now switch modes
                changeUIMode("readyToEnterMoves");
                render();
            }
        });
    }

    if (selectedAntDisplayed.cast === "Worker") {
        const digTunnelActions = possibleDigTunnelActions(displayedGameState, startOfTurnGameState, playerColony, uiModeData.selectedAntNumber);
        if (digTunnelActions.length > 0) {
            buttons.push({
                label: "Dig Tunnel",
                action: function () {
                    const data = {
                        selectedAntNumber: uiModeData.selectedAntNumber,
                        digTunnelActions: digTunnelActions,
                    };
                    changeUIMode("selectingDigTunnelLocation", data);
                    render();
                }
            });
        }
    }

    if (selectedAntDisplayed.cast === "Worker") {
        const digChamberActions = possibleDigChamberActions(displayedGameState, startOfTurnGameState, playerColony, uiModeData.selectedAntNumber);
        if (digChamberActions.length > 0) {
            const digAction = digChamberActions[0]; // there will only be one, and this is it
            buttons.push({
                label: "Dig Chamber",
                action: function() {
                    // Record the action
                    setPlayerAction(uiModeData.selectedAntNumber, digAction);
                    applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, digAction);
                    // Return to entering commands
                    changeUIMode("readyToEnterMoves");
                    render();
                }
            });
        }
    }

    if (selectedAntDisplayed.cast === "Larva") {
        buttons.push({
            label: "Feed larva worker ant food",
            action: function() {
                const action = {name: "Mature", cast: "Worker"};
                setPlayerAction(uiModeData.selectedAntNumber, action);
                applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, action);

                // Now switch modes
                changeUIMode("readyToEnterMoves");

                // Re-render the screen
                render();
            },
        });
        buttons.push({
            label: "Feed larva warrior ant food",
            action: function() {
                const action = {name: "Mature", cast: "Soldier"};
                setPlayerAction(uiModeData.selectedAntNumber, action);
                applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, action);

                // Now switch modes
                changeUIMode("readyToEnterMoves");

                // Re-render the screen
                render();
            },
        });
    }

    return buttons;
}

/*
 * This is a uiMode which is used when the player has selected an ant and is giving instructions on
 * what that ant should do. In uiModeData it expects a field, "selectedAntNumber" which will always
 * be set to the number of the ant that is being commanded and a field "moveActions" which is an array
 * of the move actions that the ant can take.
 */
const commandingAnAnt = {

    enterMode: function(uiModeData) {
        const selectedAntNumber = uiModeData.selectedAntNumber;
        const startOfTurnAnts = startOfTurnGameState.colonies[playerColony].ants;
        const isNewAnt = selectedAntNumber >= startOfTurnAnts.length; // whether this ant was created during the turn
        let prevAction;
        if (isNewAnt) {
            const newAntOrigin = newAntOrigins[selectedAntNumber - startOfTurnAnts.length];
            if (newAntOrigin.source === "Matured") {
                throw Error(`Should not be able to command a newly-matured ant.`);
            } else if (newAntOrigin.source === "Split") {
                // Highlight the hex
                const origSplitAntNumber = newAntOrigin.antNumber;
                highlightedHex = startOfTurnAnts[origSplitAntNumber].location;
                const splitAction = playerActionSelections[origSplitAntNumber];
                prevAction = splitAction.actions[newAntOrigin.order];
            } else {
                throw Error(`Unsupported value for newAntOrigin.source: '${newAntOrigin.source}'`);
            }
        } else {
            // Highlight the hex
            highlightedHex = startOfTurnAnts[selectedAntNumber].location;
            prevAction = playerActionSelections[selectedAntNumber];
        }

        const isSplitAnt = prevAction !== null && prevAction.name === "Split"; // is this the orig ant that split
        if (isSplitAnt) {
            // it was split, and the TRUE action is what happened to the 0th stack
            const splitAction = prevAction;
            prevAction = prevAction.actions[0];
        }

        // Revert the previous action
        revertAction(displayedGameState, startOfTurnGameState, playerColony, selectedAntNumber, prevAction);

        // (Now that it's reverted) find out where the ant is allowed to move
        uiModeData.moveActions = possibleMoves(startOfTurnGameState, displayedGameState, playerColony, selectedAntNumber);

        // Now put us back to an action of "None".
        setPlayerAction(selectedAntNumber, {"name": "None"});

        // Now find the list of valid move actions. Store it in uiModeData
        uiModeData.moveActions = possibleMoves(startOfTurnGameState, displayedGameState, playerColony, selectedAntNumber);

        // now make visible the places we can move to
        indicatedHexes.length = 0; // clear out any indicated hexes
        uiModeData.moveActions.forEach(moveAction => {
            const destination = moveAction.steps[moveAction.steps.length - 1]; // last step is the location
            const indication = {
                location: destination,
                color: "#FFFF0066",
            };
            indicatedHexes.push(indication);
        });
    },

    exitMode: function(uiModeData) {
        highlightedHex = null; // deselect it
        indicatedHexes.length = 0; // remove all items from the array
    },

    onClickHex: function(coord, uiModeData) {
        //either deselect space and enter ready to enter move mode or if there
        //is more than one ant on space enter commanding an ant for that ant

        if (coordEqual(coord, highlightedHex)) {
            const playerAnts = displayedGameState.colonies[playerColony].ants;
            //get ants AFTER the ones we have selected
            antNums = getAntNumsAt(playerAnts, coord, lastSelectedAntNum+1);
            if (antNums.length >0){
                lastSelectedAntNum = antNums[0];
                const data = {
                    selectedAntNumber: lastSelectedAntNum,
                };
                changeUIMode("commandingAnAnt", data);
            } else {
                changeUIMode("readyToEnterMoves");
            }
            render();
            return;
        }


        // --- find out if we clicked a place we can move to ---
        let selectedADestination = false;
        indicatedHexes.forEach(indication => {
            if (coordEqual(coord, indication.location)) {
                selectedADestination = true;
            }
        });

        // --- do things ---
        if (selectedADestination) {
            // We decided to move this ant someplace. Find that one and set it.
            const movesEndingWhereWeSelected = uiModeData.moveActions.filter(moveAction => {
                const moveDestination = moveAction.steps[moveAction.steps.length - 1];
                return coordEqual(moveDestination, coord);
            });

            // Make sure things are working right
            if (movesEndingWhereWeSelected.length !== 1) {
                throw Error(`Did NOT have exactly one move ending in the location, had ${movesEndingWhereWeSelected}`);
            }
            const moveAction = movesEndingWhereWeSelected[0];

            // Make the move
            setPlayerAction(uiModeData.selectedAntNumber, moveAction);

            applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, moveAction);
        } else {

            // clicked away; we should exit out of commanding an ant mode
        }
        changeUIMode("readyToEnterMoves");
        render();
    },

    actionButtons: commandingAnAntActionButtons,

    uiControls: function(uiModeData) {
        return {
            actionButtons: commandingAnAntActionButtons(uiModeData)
        };
    },

};


/*
 * This is a uiMode which is used when a player has selected an ant and told it to attack and is
 * giving it instructions on where to go. In the uiModeData, there is a field, "selectedAntNumber"
 * which will always be set to the number of the ant that is being commanded. there is another fild named attackActions
 * that is a list of possible attack actions (see dataStructures.js).
 */
const selectingAttackDestination = {

    enterMode: function(uiModeData) {
        // Highlight the attacking ant
        highlightedHex = displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber].location;

        // indicate the hexes that it could go to
        uiModeData.attackActions.forEach(attackAction => {
            const indication = {
                location: attackAction.steps[attackAction.steps.length - 1],
                color: "#FFFF0066",
            };
            indicatedHexes.push(indication);
        });
    },

    exitMode: function(uiModeData) {
        highlightedHex = null; // deselect it
        indicatedHexes.length = 0; // remove all items from the array
    },

    onClickHex: function(coord, uiModeData) {
        // In case we clicked wrong, default to setting the action to "None":
        setPlayerAction(uiModeData.selectedAntNumber, {name: "None"});

        // See if we clicked on one of the attackable locations...
        uiModeData.attackActions.forEach(attackAction => {
            if (coordEqual(attackAction.steps[attackAction.steps.length - 1], coord)) {
                // We DID click on an attackable location, so set an actual attack action (instead of the "None")!
                setPlayerAction(uiModeData.selectedAntNumber, attackAction);
                applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, attackAction);
            }
        });

        // Either way, we're exiting this short-term mode
        changeUIMode("readyToEnterMoves");
        render();
    },

    actionButtons: function(uiModeData) {
        return [];
    },

    uiControls: function(uiModeData) {
        return {};
    },
};



/*
 * This is a uiMode which is used when a player has selected an ant and told it to dig and is
 * giving it instructions on where to dig. In the uiModeData, there is a field, "selectedAntNumber"
 * which will always be set to the number of the ant that is being commanded. There is another
 * field named digTunnelActions that is a list of possible digTunnel actions  (see dataStructures.js).
 */
const selectingDigTunnelLocation = {

    enterMode: function(uiModeData) {
        // Highlight the digging ant
        highlightedHex = displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber].location;

        // indicate the hexes that it could dig
        uiModeData.digTunnelActions.forEach(digAction => {
            const indication = {
                location: digAction.location,
                color: "#FFFF0066",
            };
            indicatedHexes.push(indication);
        });
    },

    exitMode: function(uiModeData) {
        highlightedHex = null; // deselect it
        indicatedHexes.length = 0; // remove all items from the array
    },

    onClickHex: function(coord, uiModeData) {
        // In case we clicked wrong, default to setting the action to "None":
        setPlayerAction(uiModeData.selectedAntNumber, {name: "None"});

        // See if we clicked on one of the diggable locations...
        uiModeData.digTunnelActions.forEach(digAction => {
            if (coordEqual(digAction.location, coord)) {
                // We DID click on a diggable location, so set an actual dig action (instead of the "None")!
                setPlayerAction(uiModeData.selectedAntNumber, digAction);
                applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, digAction);
            }
        });

        // Either way, we're exiting this short-term mode
        changeUIMode("readyToEnterMoves");
        render();
    },

    actionButtons: function(uiModeData) {
        return [];
    },

    uiControls: function(uiModeData) {
        return {};
    },
};


/*
 * This is an uiMode which is used when a player has selected an ant and decided to split it into
 * some number of smaller stacks. In the uiModeData there is a field "selectedAntNumber" which
 * will always be set to the number of the ant being split.
 */
const splittingAntStack = {

    enterMode: function(uiModeData) {
        // Highlight the splitting ant
        highlightedHex = displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber].location;
    },

    exitMode: function(uiModeData) {
        highlightedHex = null; // deselect it
    },

    onClickHex: function(coord, uiModeData) {
        // For ANY click on the game board, we will exit this short-term mode
        changeUIMode("readyToEnterMoves");
        render();
    },

    actionButtons: function(uiModeData) {
        return [];
    },

    uiControls: function(uiModeData) {
        const origStack = displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber];
        const numberOfAnts = origStack.numberOfAnts;
        const onDone = function(newStackCounts) {
            if (newStackCounts.length < 2) {
                throw Error(`splits should always be into at least two stacks`);
            }
            if (!newStackCounts.every(x => x >= 1)) {
                throw Error(`splits should always have at least 1 in each stack`);
            }
            const splitAction = {
                name: "Split",
                newStackCounts: newStackCounts,
                actions: newStackCounts.map(() => null),
            };
            setPlayerAction(uiModeData.selectedAntNumber, splitAction);
            applyAction(displayedGameState, playerColony, uiModeData.selectedAntNumber, splitAction);

            // Now that it's all set up, change modes to command the last one we created
            const selectedAntNumber = displayedGameState.colonies[playerColony].ants.length - 1;
            changeUIMode("commandingAnAnt", {selectedAntNumber});
            render();
        };
        return {
            splitter: {numberOfAnts, onDone}
        };
    },
};



uiModes = {
    watchingTurnHappen,
    readyToEnterMoves,
    commandingAnAnt,
    selectingAttackDestination,
    selectingDigTunnelLocation,
    splittingAntStack,
}
