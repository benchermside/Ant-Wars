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


/*
 * This is a uiMode which is used when the player is ready to begin entering the actions for
 * their colony. This is the starting mode when a player's turn begins, and in many ways is
 * the "default" mode.
 */
const readyToEnterMoves = {
    enterMode: function() {
        // Indicate the ants that still need to be moved
        indicatedHexes.length = 0;
        playerActionSelections.forEach((actionSelection, antNumber) => {
            if (actionSelection === null) {
                const indication = {
                    location: gameState.colonies[playerColony].ants[antNumber].location,
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
                const playerAnts = gameState.colonies[playerColony].ants;
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
                label: "End Turn",
                action: function() {
                    endTurn();
                    startNewTurn();
                    render();
                },
                enabled: enableEndTurn,
            }
        ]
    }
};


/*
 * This is a uiMode which is used when the player has selected an ant and is giving instructions on
 * what that ant should do. There is a field, "selectedAntNumber" which will always be set to the
 * number of the ant that is being commanded. There is also a field "newState" that is used for
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

        // record the selectedAntNumber
        newUIMode.selectedAntNumber = selectedAntNumber;

        // return it
        return newUIMode;
    },

    enterMode: function() {
        const selectedAntNumber = uiMode.selectedAntNumber;

        // put the ant back where it started from if it already moved
        const ant = gameState.colonies[playerColony].ants[selectedAntNumber];
        ant.location = ant.startLocation;
        playerActionSelections[selectedAntNumber] = {"name": "None"};

        // now make visible the places we can move to
        indicatedHexes.length = 0; // clear out any indicated hexes
        const moves = possibleMoves(gameState, playerColony, selectedAntNumber);
        moves.forEach(coord => {
            const indication = {
                location: coord,
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
            // We decided to move this ant someplace. Record that.
            playerActionSelections[uiMode.selectedAntNumber] = {name: "Move", destination: coord};

            // Now change the ant's location (but not startLocation) to show it on the screen
            gameState.colonies[playerColony].ants[uiMode.selectedAntNumber].location = coord;
        } else {
            // clicked away; we should exit out of commanding an ant mode
        }
        changeUIMode(uiModes.readyToEnterMoves);
        render();
    },

    actionButtons: function() {
        const buttons = [];
        const selectedAnt = gameState.colonies[playerColony].ants[uiMode.selectedAntNumber];

        buttons.push({
            label: "Do Nothing",
            enabled: true,
            action: function() {
                // We decided to move this ant someplace. Record that.
                playerActionSelections[uiMode.selectedAntNumber] = {name: "None"};
                // Now change the ant's location (but not startLocation) to show it on the screen
                selectedAnt.location = selectedAnt.startLocation;
                // Now switch modes
                changeUIMode(uiModes.readyToEnterMoves);
                render();
            },
        });
        if (selectedAnt.cast === "Queen") {
            // Queens can lay an egg if they're in a chamber
            const coord = selectedAnt.location;
            const terrain = gameState.terrainGrid[coord[1]][coord[0]];
            if (terrain === 5) {
                buttons.push({
                    label: "Lay Egg",
                    enabled: true,
                    action: function() {
                        // We decided to lay an egg. Record that.
                        playerActionSelections[uiMode.selectedAntNumber] = {name: "LayEgg"};

                        // Now switch modes
                        changeUIMode(uiModes.readyToEnterMoves);

                        // Re-render the screen
                        render();
                    },
                });
            }
        }
        if (selectedAnt.cast === "Worker") {
            const thingsToDig = [
                {whatToDig: "Tunnel", buttonLabel: "Dig Tunnel"},
                {whatToDig: "Chamber", buttonLabel: "Dig Chamber"},
            ];
            // Workers may be able to dig a tunnel or a chamber (if there is an appropriate spot beside them)
            thingsToDig.forEach(thingToDig => {
                const digActions = possibleDigActions(gameState, playerColony, uiMode.selectedAntNumber, thingToDig.whatToDig);
                if (digActions.length > 0) {
                    buttons.push({
                        label: thingToDig.buttonLabel,
                        enabled: true,
                        action: function() {
                            changeUIMode(uiModes.selectingDigLocation.newState(uiMode.selectedAntNumber, thingToDig.whatToDig));
                            render();
                        }
                    });
                }
            });
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
const selectingDigLocation = {

    /*
     * You don't enter the general "selectingDigLocation" mode, instead you make a SPECIFIC
     * "selectingDigTunnelLocation" state for that particular ant and the particular thing it is
     * making. So call selectingDigTunnelLocation.newState(selectedAntNumber, whatToDig) to create
     * that specific state to pass to the changeUIMode() function.
     */
    newState: function(selectedAntNumber, whatToDig) {
        // Make a NEW copy since we'll be setting a field in the object
        const newUIMode = Object.create(selectingDigLocation);

        // record the fields
        newUIMode.selectedAntNumber = selectedAntNumber;
        newUIMode.whatToDig = whatToDig;

        // record the digActions
        newUIMode.digActions = possibleDigActions(gameState, playerColony, selectedAntNumber, whatToDig);

        // return it
        return newUIMode;
    },

    enterMode: function() {
        const selectedAntNumber = uiMode.selectedAntNumber;

        // Highlight the digging ant
        highlightedHex = gameState.colonies[playerColony].ants[selectedAntNumber].location;

        // indicate the hexes that it could dig
        uiMode.digActions.forEach(digAction => {
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
        uiMode.digActions.forEach(digAction => {
            if (coordEqual(digAction.location, coord)) {
                // We DID click on a diggable location, so set an actual dig action (instead of the "None")!
                playerActionSelections[uiMode.selectedAntNumber] = digAction;
                // Now change the ant's location (but not startLocation) to show it on the screen
                gameState.colonies[playerColony].ants[uiMode.selectedAntNumber].location = coord;
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
    readyToEnterMoves: readyToEnterMoves,
    commandingAnAnt: commandingAnAnt,
    selectingDigLocation: selectingDigLocation,
}
