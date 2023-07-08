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
// Some UI modes need to track additional information. This will be stored in the uiModeData
// global variable which is cleared out and re-created each time we change modes.


const watchingTurnHappen = {
    enterMode: function(uiModeData) {
        // --- Put the game state back to how it started ---
        displayedGameState = structuredClone(startOfTurnGameState);

        //reduce all turn to hatch eggs by 1; if any reach 0 put an action on the quuee???



        // --- Find the random seed for this turn. ---
        // NOTE: Later we'll need to get this from the host
        // NOTE: Pick a random number that fits into 32 bits
        const seed = Math.floor(Math.random() * 0xFFFFFFFF);

        // --- Now call the animation function which will run for a few seconds, then exit the mode ---
        const animationState = {
            colonySelections: getColonySelections(),
            stage: 0,
            substage: "After",
            interactions: [],
            randomNumberSource: newRandomSequence(seed),
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
        console.log ("at start of onClickHex");
        console.log ("coord", coord);
        console.log ("highlightedHex ", highlightedHex);
        console.log ("lastSelectedAntNum", lastSelectedAntNum);

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
            console.log ("highlightedHex ", highlightedHex);
            console.log ("lastSelectedAntNum", lastSelectedAntNum);
            if (coordEqual(coord, highlightedHex) && (lastSelectedAntNum !== null)){
                console.log ("already selected an ant");
                antNums = getAntsAt(playerAnts, coord, lastSelectedAntNum+1);
            } else {
                antNums = getAntsAt(playerAnts, coord);
            }
            console.log ("antNums:", antNums);

            if (coordEqual(coord, highlightedHex) && (antNums.length <1))
            {
                // we clicked on the selected hex and have cycled through any ants on it ; just de-select it.
                highlightedHex = null;
                lastSelectedAntNum = null;
                render();
            } else {
                highlightedHex = coord;
                if (antNums.length >0) {
                    lastSelectedAntNum = antNums[0];
                    const data = {
                        selectedAntNumber: lastSelectedAntNum,
                    };
                    console.log("commandingAntAnt data:", data);
                    changeUIMode("commandingAnAnt", data);
                }
                render();
            }
        }
    },

    actionButtons: function(uiModeData) {
        // If we've entered moves for ALL ants, enable the end-turn button
        const enableEndTurn = playerActionSelections.every(action => action !== null);
        return [
            {
                label: enableEndTurn? "End Turn" : "Skip Remaining Ants",
                action: function() {
                    // The turn is truly ended and now we're going to watch the turn happen.
                    changeUIMode("watchingTurnHappen");
                },
            }
        ]
    }
};


/*
 * This is a uiMode which is used when the player has selected an ant and is giving instructions on
 * what that ant should do. In uiModeData it expects a field, "selectedAntNumber" which will always
 * be set to the number of the ant that is being commanded and a field "moveActions" which is an array
 * of the move actions that the ant can take.
 */
const commandingAnAnt = {

    enterMode: function(uiModeData) {
        const selectedAntNumber = uiModeData.selectedAntNumber;
        highlightedHex = startOfTurnGameState.colonies[playerColony].ants[selectedAntNumber].location;

        // Revert the previous action
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

        // (Now that it's reverted) find out where the ant is allowed to move
        uiModeData.moveActions = possibleMoves(startOfTurnGameState, displayedGameState, playerColony, selectedAntNumber);

        // Now put us back to an action of "None".
        playerActionSelections[selectedAntNumber] = {"name": "None"};

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
        console.log("highlightedHex in existMOde of commanding an ant", highlightedHex);
        highlightedHex = null; // deselect it
        indicatedHexes.length = 0; // remove all items from the array
    },

    onClickHex: function(coord, uiModeData) {
        console.log ("in onClickHex of commanding an ant");
        //either deselect space and enter ready to enter move mode or if there
        //is more than one ant on space enter commanding an ant for that ant
        console.log ("highlightedHex",highlightedHex);

        if (coordEqual(coord, highlightedHex)){
            const playerAnts = displayedGameState.colonies[playerColony].ants;
            //get ants AFTER the ones we have selected
            antNums = getAntsAt(playerAnts, coord, lastSelectedAntNum+1);
            console.log ("antNums:", antNums);
            if (antNums.length >0){
                lastSelectedAntNum = antNums[0];
                const data = {
                    selectedAntNumber: lastSelectedAntNum,
                };
                console.log("commandingAntAnt data:", data);
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
            const move = movesEndingWhereWeSelected[0];

            // Make the move
            playerActionSelections[uiModeData.selectedAntNumber] = move;

            // Now change the ant's displayed location to show it on the screen
            const displayedAnt = displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber];
            if (move.steps.length >1){
                displayedAnt.facing = getNewFacing(move.steps[move.steps.length - 2],move.steps[move.steps.length - 1] );
            }
            displayedAnt.location = move.steps[move.steps.length - 1];

        } else {

            // clicked away; we should exit out of commanding an ant mode
        }
        changeUIMode("readyToEnterMoves");
        render();
    },

    actionButtons: function(uiModeData) {
        const buttons = [];
        const selectedAntStartOfTurn = startOfTurnGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber];
        const selectedAntDisplayed = displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber];

        buttons.push({
            label: "Do Nothing",
            action: function() {
                // We decided to move this ant someplace. Record that.
                playerActionSelections[uiModeData.selectedAntNumber] = {name: "None"};
                // Now change the ant's displayed location back to its start location to show it on the screen
                selectedAntDisplayed.location = selectedAntStartOfTurn.location;
                // Now switch modes
                changeUIMode("readyToEnterMoves");
                render();
            },
        });
        if (selectedAntDisplayed.cast === "Queen") {
            // Queens can lay an egg if they're in a chamber
            const coord = selectedAntDisplayed.location;
            const terrain = startOfTurnGameState.terrainGrid[coord[1]][coord[0]];
            if (terrain === 5) {
                const eggStack = getEggAt(displayedGameState.colonies[playerColony].eggs, selectedAntDisplayed.location);
                if(eggStack === null || eggStack.numberOfEggs < Rules.MAX_EGGS) {
                    buttons.push({
                        label: "Lay Egg",
                        action: function() {
                            //lay egg here
                            console.log("Layinging an eggggggggggg");
                            const eggLoc = selectedAntDisplayed.location;
                            let eggStack = getEggAt(displayedGameState.colonies[playerColony].eggs, eggLoc);
                            if(eggStack === null) {
                                eggStack = {"numberOfEggs": 1, "location": eggLoc, "daysToHatch": Rules.TURNS_TO_HATCH};
                                displayedGameState.colonies[playerColony].eggs.push(eggStack);
                            } else {
                                eggStack.numberOfEggs += 1;
                            }
                            // We decided to lay an egg. Record that.
                            playerActionSelections[uiModeData.selectedAntNumber] = {name: "LayEgg"};


                            // Don't move anywhere
                            selectedAntDisplayed.location = selectedAntStartOfTurn.location;

                            // Now switch modes
                            changeUIMode("readyToEnterMoves");

                            // Re-render the screen
                            render();
                        },
                    });
                }
            }
        }
        if (selectedAntDisplayed.cast === "Worker") {
            const digTunnelActions = possibleDigTunnelActions(startOfTurnGameState, playerColony, uiModeData.selectedAntNumber);
            if (digTunnelActions.length > 0) {
                buttons.push({
                    label: "Dig Tunnel",
                    action: function() {
                        const data = {
                            selectedAntNumber: uiModeData.selectedAntNumber,
                            digTunnelActions: digTunnelActions,
                        };
                        changeUIMode("selectingDigTunnelLocation", data);
                        render();
                    }
                });
            }

            const digChamberActions = possibleDigChamberActions(startOfTurnGameState, playerColony, uiModeData.selectedAntNumber);
            if (digChamberActions.length > 0) {
                const digAction = digChamberActions[0]; // there will only be one, and this is it
                buttons.push({
                    label: "Dig Chamber",
                    action: function() {
                        // Record the action
                        playerActionSelections[uiModeData.selectedAntNumber] = digAction;
                        // Display that it will be dug
                        const loc = digAction.location;
                        displayedGameState.terrainGrid[loc[1]][loc[0]] = 5;
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
                    //HAVE TO WRITE THIS
                    // We decided to lay an egg. Record that.
                    playerActionSelections[uiModeData.selectedAntNumber] = {name: "MatureToWorker"};

                    // Don't move anywhere
                    selectedAntDisplayed.location = selectedAntStartOfTurn.location;

                    // Now switch modes
                    changeUIMode("readyToEnterMoves");

                    // Re-render the screen
                    render();
                },
            });
            buttons.push({
                label: "Feed larva warrior ant food",
                action: function() {
                    //HAVE TO WRITE THIS
                    // We decided to lay an egg. Record that.
                    playerActionSelections[uiModeData.selectedAntNumber] = {name: "MatureToSoldier"};

                    // Don't move anywhere
                    selectedAntDisplayed.location = selectedAntStartOfTurn.location;

                    // Now switch modes
                    changeUIMode("readyToEnterMoves");

                    // Re-render the screen
                    render();
                },
            });

        }


            return buttons;
    },

};


/*
 * This is a uiMode which is used when a player has selected an ant and told it to dig and is
 * giving it instructions on where to dig. In the uiModeData, there is a field, "selectedAntNumber"
 * which will always be set to the number of the ant that is being commanded. There is also a field
 * named "whatToDig" which is a WhatToDig (see dataStructures.js).
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
        playerActionSelections[uiModeData.selectedAntNumber] = {name: "None"};

        // See if we clicked on one of the diggable locations...
        uiModeData.digTunnelActions.forEach(digAction => {
            if (coordEqual(digAction.location, coord)) {
                // We DID click on a diggable location, so set an actual dig action (instead of the "None")!
                playerActionSelections[uiModeData.selectedAntNumber] = digAction;
                // Now change the ant's displayed location to show it on the screen
                displayedGameState.colonies[playerColony].ants[uiModeData.selectedAntNumber].location = coord;
                // Now show the tunnel as having been dug!
                displayedGameState.terrainGrid[coord[1]][coord[0]] = 4;
            }
        });

        // Either way, we're exiting this short-term mode
        changeUIMode("readyToEnterMoves");
        render();
    },

    actionButtons: function(uiModeData) {
        return [];
    },
};



uiModes = {
    watchingTurnHappen,
    readyToEnterMoves,
    commandingAnAnt,
    selectingDigTunnelLocation,
}
