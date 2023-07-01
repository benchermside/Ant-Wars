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
// Some UI modes have additional fields. Specifically, the commandingAnAnt mode has a field
// named "selectedAntNumber" which will always be set to the number of an ant in the player's
// colony which is currently being commanded.


const watchingTurnHappen = {
    enterMode: function() {
        // --- Put the game state back to how it started ---
        displayedGameState = structuredClone(startOfTurnGameState);

        // --- Now call the animation function which will run for a few seconds, then exit the mode ---
        const animationState = {
            colonySelections: getColonySelections(),
            stage: 0,
        };
        sweepScreen("#000000"); // show blank screen briefly
        setTimeout(animate, 500, animationState); // then run the animation
    },

    exitMode: function() {
    },

    onClickHex: function(coord) {
    },

    actionButtons: () => [],
};

/*
 * This is a uiMode which is used when the player is ready to begin entering the actions for
 * their colony. This is the starting mode when a player's turn begins, and in many ways is
 * the "default" mode.
 */
const readyToEnterMoves = {
    enterMode: function() {
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

    exitMode: function() {
        highlightedHex = null; // de-select the currently selected location (if any)
    },

    onClickHex: function(coord) {
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
            if (coordEqual(coord, highlightedHex)) {
                // we clicked on the selected hex; just de-select it.
                highlightedHex = null;
                render();
            } else {
                // we selected some hex
                highlightedHex = null; // de-select the currently selected location (if any)
                highlightedHex = coord;
                let selectedAnAnt = false;
                const playerAnts = displayedGameState.colonies[playerColony].ants;
                playerAnts.forEach((ant, antNumber) => {
                    if (!selectedAnAnt) {
                        if (coordEqual(ant.location, coord)) {
                            // We just selected a player's ant!
                            selectedAnAnt = true;
                            changeUIMode(uiModes.commandingAnAnt.newState(antNumber));
                        }
                    }
                });
                render();
            }
        }
    },

    actionButtons: function() {
        // If we've entered moves for ALL ants, enable the end-turn button
        const enableEndTurn = playerActionSelections.every(action => action !== null);
        return [
            {
                label: enableEndTurn? "End Turn" : "Skip Remaining Ants",
                action: function() {
                    // The turn is truly ended and now we're going to watch the turn happen.
                    changeUIMode(uiModes.watchingTurnHappen);
                },
            }
        ]
    }
};


/*
 * This is a uiMode which is used when the player has selected an ant and is giving instructions on
 * what that ant should do. There is a field, "selectedAntNumber" which will always be set to the
 * number of the ant that is being commanded. There is a field "moveActions" which is an array of
 * the move actions that the ant can take. There is also a field "newState" that is used for
 * creating the specific commandingAnAnt instance that has the selectedAntNumber field set.
 */
const commandingAnAnt = {

    /*
     * You don't enter the general "commandingAnAnt" mode, instead you make a SPECIFIC "commandingAnAnt"
     * state for that particular ant. So call commandingAnAnt.newState(selectedAntNumber) to create that
     * specific state to pass to the changeUIMode() function.
     */
    newState: function(selectedAntNumber) {
        // Make a NEW copy since we'll be setting a field in the object
        const newUIMode = Object.create(commandingAnAnt);

        // Find out the allowed moves
        const moveActions = newPossibleMoves(startOfTurnGameState, playerColony, selectedAntNumber);

        // record the selectedAntNumber and moveActions
        newUIMode.selectedAntNumber = selectedAntNumber;
        newUIMode.moveActions = moveActions;

        // return it
        return newUIMode;
    },

    enterMode: function() {
        const selectedAntNumber = uiMode.selectedAntNumber;
        const moveActions = uiMode.moveActions;

        // Find previous action (if any) so we can revert it
        const prevAction = playerActionSelections[selectedAntNumber];

        if (prevAction === null || prevAction.name === "None") {
            // nothing to put back
        } else if (prevAction.name === "Move") {
            // put the ant back where it started from
            const displayedAnt = displayedGameState.colonies[playerColony].ants[selectedAntNumber];
            const startOfTurnAnt = startOfTurnGameState.colonies[playerColony].ants[selectedAntNumber];
            displayedAnt.location = startOfTurnAnt.location;
        } else if (prevAction.name === "Dig") {
            // put the ant back where it started from
            const displayedAnt = displayedGameState.colonies[playerColony].ants[selectedAntNumber];
            const startOfTurnAnt = startOfTurnGameState.colonies[playerColony].ants[selectedAntNumber];
            displayedAnt.location = startOfTurnAnt.location;
            // put the terrainGrid back as it was
            const loc = prevAction.location;
            displayedGameState.terrainGrid[loc[1]][loc[0]] = startOfTurnGameState.terrainGrid[loc[1]][loc[0]];
        } else if (prevAction.name === "LayEgg") {
            // nothing to put back for now
        } else {
            throw Error(`Unexpected type of action: ${prevAction.name}`);
        }

        // Now put us back to an action of "None".
        playerActionSelections[selectedAntNumber] = {"name": "None"};

        // now make visible the places we can move to
        indicatedHexes.length = 0; // clear out any indicated hexes
        moveActions.forEach(moveAction => {
            const destination = moveAction.steps[moveAction.steps.length - 1]; // last step is the location
            const indication = {
                location: destination,
                color: "#FFFF0066",
            };
            indicatedHexes.push(indication);
        });
    },

    exitMode: function() {
        highlightedHex = null; // deselect it
        indicatedHexes.length = 0; // remove all items from the array
    },

    onClickHex: function(coord) {
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
            const movesEndingWhereWeSelected = uiMode.moveActions.filter(moveAction => {
                const moveDestination = moveAction.steps[moveAction.steps.length - 1];
                return coordEqual(moveDestination, coord);
            });

            // Make sure things are working right
            if (movesEndingWhereWeSelected.length !== 1) {
                throw Error(`Did NOT have exactly one move ending in the location, had ${movesEndingWhereWeSelected}`);
            }
            const move = movesEndingWhereWeSelected[0];

            // Make the move
            playerActionSelections[uiMode.selectedAntNumber] = move;

            // Now change the ant's displayed location to show it on the screen
            displayedGameState.colonies[playerColony].ants[uiMode.selectedAntNumber].location = move.steps[move.steps.length - 1];
        } else {
            // clicked away; we should exit out of commanding an ant mode
        }
        changeUIMode(uiModes.readyToEnterMoves);
        render();
    },

    actionButtons: function() {
        const buttons = [];
        const selectedAntStartOfTurn = startOfTurnGameState.colonies[playerColony].ants[uiMode.selectedAntNumber];
        const selectedAntDisplayed = displayedGameState.colonies[playerColony].ants[uiMode.selectedAntNumber];

        buttons.push({
            label: "Do Nothing",
            action: function() {
                // We decided to move this ant someplace. Record that.
                playerActionSelections[uiMode.selectedAntNumber] = {name: "None"};
                // Now change the ant's displayed location back to its start location to show it on the screen
                selectedAntDisplayed.location = selectedAntStartOfTurn.location;
                // Now switch modes
                changeUIMode(uiModes.readyToEnterMoves);
                render();
            },
        });
        if (selectedAntDisplayed.cast === "Queen") {
            // Queens can lay an egg if they're in a chamber
            const coord = selectedAntDisplayed.location;
            const terrain = startOfTurnGameState.terrainGrid[coord[1]][coord[0]];
            if (terrain === 5) {
                buttons.push({
                    label: "Lay Egg",
                    action: function() {
                        // We decided to lay an egg. Record that.
                        playerActionSelections[uiMode.selectedAntNumber] = {name: "LayEgg"};

                        // Don't move anywhere
                        selectedAntDisplayed.location = selectedAntStartOfTurn.location;

                        // Now switch modes
                        changeUIMode(uiModes.readyToEnterMoves);

                        // Re-render the screen
                        render();
                    },
                });
            }
        }
        if (selectedAntDisplayed.cast === "Worker") {
            const digTunnelActions = possibleDigTunnelActions(startOfTurnGameState, playerColony, uiMode.selectedAntNumber);
            if (digTunnelActions.length > 0) {
                buttons.push({
                    label: "Dig Tunnel",
                    action: function() {
                        changeUIMode(uiModes.selectingDigTunnelLocation.newState(uiMode.selectedAntNumber, digTunnelActions));
                        render();
                    }
                });
            }

            const digChamberActions = possibleDigChamberActions(startOfTurnGameState, playerColony, uiMode.selectedAntNumber);
            if (digChamberActions.length > 0) {
                const digAction = digChamberActions[0]; // there will only be one, and this is it
                buttons.push({
                    label: "Dig Chamber",
                    action: function() {
                        // Record the action
                        playerActionSelections[uiMode.selectedAntNumber] = digAction;
                        // Display that it will be dug
                        const loc = digAction.location;
                        displayedGameState.terrainGrid[loc[1]][loc[0]] = 5;
                        // Return to entering commands
                        changeUIMode(uiModes.readyToEnterMoves);
                        render();
                    }
                });
            }
        }
        return buttons;
    },

    selectedAntNumber: 0, // this will get set to the ant number of the ant that is selected.
};


/*
 * This is a uiMode which is used when a player has selected an ant and told it to dig and is
 * giving it instructions on where to dig. There is a field, "selectedAntNumber" which will
 * always be set to the number of the ant that is being commanded. There is also a field named
 * "whatToDig" which is a WhatToDig (see dataStructures.js). There is also a field
 * "newState" that is used for creating the specific commandingAnAnt instance that has the
 * selectedAntNumber field set.
 */
const selectingDigTunnelLocation = {

    /*
     * You don't enter the general "selectingDigTunnelLocation" mode, instead you make a SPECIFIC
     * "selectingDigTunnelLocation" state for that particular ant and the particular thing it is
     * making. So call selectingDigTunnelLocation.newState(selectedAntNumber, digTunnelActions) to
     * create that specific state to pass to the changeUIMode() function.
     */
    newState: function(selectedAntNumber, digTunnelActions) {
        // Make a NEW copy since we'll be setting a field in the object
        const newUIMode = Object.create(selectingDigTunnelLocation);

        // record the fields
        newUIMode.selectedAntNumber = selectedAntNumber;
        newUIMode.digTunnelActions = digTunnelActions;

        // return it
        return newUIMode;
    },

    enterMode: function() {
        const selectedAntNumber = uiMode.selectedAntNumber;

        // Highlight the digging ant
        highlightedHex = displayedGameState.colonies[playerColony].ants[selectedAntNumber].location;

        // indicate the hexes that it could dig
        uiMode.digTunnelActions.forEach(digAction => {
            const indication = {
                location: digAction.location,
                color: "#FFFF0066",
            };
            indicatedHexes.push(indication);
        });
    },

    exitMode: function() {
        highlightedHex = null; // deselect it
        indicatedHexes.length = 0; // remove all items from the array
    },

    onClickHex: function(coord) {
        // In case we clicked wrong, default to setting the action to "None":
        playerActionSelections[uiMode.selectedAntNumber] = {name: "None"};

        // See if we clicked on one of the diggable locations...
        uiMode.digTunnelActions.forEach(digAction => {
            if (coordEqual(digAction.location, coord)) {
                // We DID click on a diggable location, so set an actual dig action (instead of the "None")!
                playerActionSelections[uiMode.selectedAntNumber] = digAction;
                // Now change the ant's displayed location to show it on the screen
                displayedGameState.colonies[playerColony].ants[uiMode.selectedAntNumber].location = coord;
                // Now show the tunnel as having been dug!
                displayedGameState.terrainGrid[coord[1]][coord[0]] = 4;
            }
        });

        // Either way, we're exiting this short-term mode
        changeUIMode(uiModes.readyToEnterMoves);
        render();
    },

    actionButtons: function() {
        return [];
    },
};



uiModes = {
    watchingTurnHappen,
    readyToEnterMoves,
    commandingAnAnt,
    selectingDigTunnelLocation,
}
