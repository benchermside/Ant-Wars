/*
 * This file defines a type "UI Mode" and some instances of it. These control how the user interface
 * will behave when in a certain "mode" (such as "readyToEnterMoves" or "commandingAnAnt").
 */

// UIMode:
//
// A UIMode is an collection of functions that control the behavior of the UI while the user is
// doing something. For instance, in the middle of giving order to an ant the UI should behave
// differently than when selecting an ant or when just viewing.
//
// Every UIMode has a field named "onClickHex". This must be a function that is invoked whenever
// the user is in that mode and clicks on the map. It accepts a "coord" argument which is either
// null (if the user clicked off the map) or has the [x,y] grid coordinate of the hex that was
// clicked on. The function should take appropriate actions depending on what the user wants to
// do.
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
                            uiMode = commandingAnAnt;
                            uiMode.enterMode(antNumber);
                        }
                    }
                });
                render();
            }
        }
    },
};


/*
 * This is a uiMode which is used when the player has selected an ant and is giving instructions on
 * what that ant should do. There is a field, "selectedAntNumber" which will always be set to the
 * number of the ant that is being commanded.
 */
const commandingAnAnt = {
    enterMode: function(selectedAntNumber) {
        // record the selectedAntNumber
        uiMode.selectedAntNumber = selectedAntNumber;

        // put the ant back where it started from if it already moved
        const ant = gameState.colonies[playerColony].ants[selectedAntNumber];
        ant.location = ant.startLocation;
        playerActionSelections[selectedAntNumber] = {"name": "None"};

        // now make visible the places we can move to
        indicatedHexes.length = 0; // clear out any indicated hexes
        const moves = possibleMoves(gameState, playerColony, selectedAntNumber);
        moves.forEach(coord => indicatedHexes.push(coord)); // make places we can move to be indicated
    },

    onClickHex: function(coord) {
        // --- find out if we clicked a place we can move to ---
        let selectedADestination = false;
        indicatedHexes.forEach(possibleDestination => {
            if (coordEqual(coord, possibleDestination)) {
                selectedADestination = true;
            }
        });

        // --- do things ---
        if (selectedADestination) {
            // We decided to move this ant someplace. Record that.
            playerActionSelections[uiMode.selectedAntNumber] = {
                "name": "Move",
                "destination": coord,
            };

            // Now change the ant's location (but not startLocation) to show it on the screen
            gameState.colonies[playerColony].ants[uiMode.selectedAntNumber].location = coord;

            // If we've entered moves for ALL ants, enable the end-turn button
            if (playerActionSelections.every(action => action !== null)) {
                enableEndTurnButton()
            }
        } else {
            // clicked away; we should exit out of commanding an ant mode
        }
        highlightedHex = null; // deselect it
        indicatedHexes.length = 0; // remove all items from the array
        uiMode = readyToEnterMoves;
        render();
    },

    selectedAntNumber: 0, // this will get set to the ant number of the ant that is selected.
};
