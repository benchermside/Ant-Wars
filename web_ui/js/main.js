/*
 * This contains the code to bootstrap the game (and some test scenarios).
 */

/* ========= Global Variables ========= */
let hexSize = 120; // starting size
let startOfTurnGameState = null; // will be populated during initialization
let displayedGameState = null;  // will be populated during initialization
let highlightedHex = null; // will always be the [x,y] coordinate of a cell OR null
let lastSelectedAntNum = null;  // if there is more than one ant in a hex, the ant number of last selected ant in that hex
                                  //during that turn;
let indicatedHexes = []; // list of indicator objects (see dataStructures.js) to mark on the map
let gameSettings = null; // the GameSettings (see dataStructures.js) for the active game (or null before there's a game going on)
let isNetworkGame = false; // network messages will only be sent if this is true
let isHostServer = null; // true or false, whether this is the host for the game
let playerColony = 0; // which colony (by number) the current player is running
let playerActionSelections = null; // the actions being entered for the current player's colony
let colonySelections = null; // an array of ColonySelection (see dataStructures.js) giving the
                            // current selected moves and readiness to end turn of each colony.
let movesHaveBeenSent = false; // tells whether this player has submitted moves for this turn


const rules = {
    MAX_EGGS:3,
    TURNS_TO_HATCH:3,
    costs: {
        digTunnelCost: 5,
        digChamberCost: 10,
        layEggCost: 10,
        upkeepCost: {
            Worker: 1,
            Soldier: 2,
            Queen: 3,
            Larva: 0,
        },
        hatchCost: {
            Worker: 4,
            Soldier: 6,
            Queen: 12,
            Larva: 0
        }
    },
};

/* ========= Variables Private to This File ========= */
let uiMode = null; // ONLY set this by calling changeUIMode()
let uiModeData = {}; // an object where the uiMode can store some data fields. Access it ONLY in this file.


/* ========= Functions ========= */

/*
 * Call this passing a color to fill the screen with a solid color. It is used briefly
 * during animation to indicate that we're and finishing the animation.
 *
 * FIXME: This is fragile right now. It draws the screen but outside of render(). So a
 *   call to render() afterward will mess up our display. We should probably fix that.
 *   When we do, fix the "hack" that I'm not calling render() after changing UIMode
 *   to "watchingTurnHappen".
 */
function sweepScreen(color) {
    const gameCanvasElem = document.getElementById("game-canvas");
    const drawContext = gameCanvasElem.getContext("2d");
    drawContext.fillStyle = color;
    drawContext.fillRect(0, 0, gameCanvasElem.width, gameCanvasElem.height);
}


/*
 * This is called to re-draw all the on-screen controls done in HTML rather than
 * on the canvas.
 */
function updateControls() {
    document.getElementById("show-foodSupply").value = displayedGameState.colonies[playerColony].foodSupply;
}


/*
 * Call this to re-draw all the game graphics.
 */
function render() {
    const gameCanvasElem = document.getElementById("game-canvas");
    const drawContext = gameCanvasElem.getContext("2d");
    drawContext.clearRect(0, 0, gameCanvasElem.width, gameCanvasElem.height);
    drawBackground(drawContext, displayedGameState.terrainGrid, hexSize);
    if (highlightedHex !== null) {
        highlightHex(drawContext, hexSize, highlightedHex);
    }
    indicatedHexes.forEach(indicator => indicateHex(drawContext, hexSize, indicator));
    drawItems(drawContext, displayedGameState, hexSize);
    updateControls();
}


/*
 * This is called with a list of "action buttons" and it displays them.
 *
 * Each button should be an object with fields "label" (a string giving the
 * text to display), and "action" (a function to call when the button is clicked).
 */
function setActionButtons(buttons) {
    const buttonsDivElem = document.getElementById("action-controls");

    // --- Remove existing buttons ---
    while (buttonsDivElem.firstChild) {
        buttonsDivElem.removeChild(buttonsDivElem.lastChild);
    }

    // --- Add new buttons ---
    buttons.forEach(button => {
        const buttonElem = document.createElement("button");
        buttonElem.innerText = button.label;
        buttonElem.addEventListener('click', button.action);
        buttonsDivElem.appendChild(buttonElem);
    });
}


/*
 * This is called to change the UIMode. It is the only place that is allowed to change the global
 * variable uiMode. The first parameter must be a sting which is a field in uiModes identifying
 * the mode to enter. The second parameter is optional -- if provided it should be an object
 * which will be used as the uiModeData.
 */
function changeUIMode(newUIMode, data) {
    // Exit the existing mode
    if (uiMode !== null) {
        uiMode.exitMode(uiModeData);
    }

    // Reset the data
    uiModeData = data === undefined ? {} : data;

    // Assign to the global variable uiMode
    uiMode = uiModes[newUIMode];
    if (uiMode === undefined) {
        throw new Error(`changeUIMode() called with invalid mode ${newUIMode}.`);
    }

    // Enter the new mode
    uiMode.enterMode(uiModeData);

    // Reset the list of action buttons
    setActionButtons(uiMode.actionButtons(uiModeData));
}


/*
 * This sets up to begin a new turn.
 */
function startNewTurn() {
    // set up the data strutures where we will collect the moves
    colonySelections = startOfTurnGameState.colonies.map((colony, colonyNumber) => {
        const player = gameSettings.playerList[colonyNumber];
        if (player.playerType === "Human") {
            // Start humans out with "not ready" and all nulls for the actions
            return {
                isReadyForEndOfTurn: false,
                actionSelections: colony.ants.map(() => null),
            };
        } else if (player.playerType === "AI") {
            // Go ahead and calculate the AI moves now. (If AIs become slow we can change to
            // do it in a webworker thread instead.)
            return {
                isReadyForEndOfTurn: true,
                actionSelections: decideAIMoves(startOfTurnGameState, colonyNumber),
            };
        } else {
            throw Error(`Invalid playerType, '${player.playerType}'`);
        }
    });
    playerActionSelections = colonySelections[playerColony].actionSelections;
    movesHaveBeenSent = false;

    // begin in readyToEnter uiMode.
    changeUIMode("readyToEnterMoves");
}


/*
 * This returns the moves that the AI chooses to make starting from the given gameState
 * and assuming the AI is playing the given colonyNumber. It returns a list of actions.
 */
function decideAIMoves(gameState, colonyNumber) {
    // === This is a dumb AI. For each ant, select a random allowed destination to move to ===
    const actionSelections = gameState.colonies[colonyNumber].ants.map((antState, antNumber) => {
        const moveActions = possibleMoves(startOfTurnGameState, displayedGameState, colonyNumber, antNumber);
        if (moveActions.length === 0) {
            return {name: "None"}; // can't move; so do nothing
        } else {
            // return a random move
            return moveActions[Math.floor(Math.random() * moveActions.length)];
        }
    });
    return actionSelections;
}


/*
 * This returns true if all the players are ready for the end of turn, and false if
 * at least one is not ready.
 */
function isEveryoneReadyForEndOfTurn() {
    return colonySelections.every(colonySelection => colonySelection.isReadyForEndOfTurn);
}


/*
 * This is passed an actionSelections list and it returns a version which has replaced any
 * nulls with DoNothing actions.
 */
function completeActionSelections(actionSelections) {
    return actionSelections.map(actionSelection =>
        actionSelection === null ? {"name": "None"} : actionSelection
    );
}


/*
 * This modifies the global variable colonySelections by filling in defaults for anything
 * that is needed to perform the end of turn but might not be entered.
 *
 * Right now, that's just changing null's to doNothing actions.
 */
function cleanUpColonySelections() {
    colonySelections.forEach(colonySelection => {
        colonySelection.actionSelections = completeActionSelections(colonySelection.actionSelections);
    });
}


/*
 * This gets called on the host server when we get new colony selections. It checks if we've
 * received ALL of them, and if so then it will jump directly into performing the end of
 * turn.
 *
 * It returns true if the turn ended and we're now animating, or false if it DIDN'T end and
 * we are NOT now animating.
 */
function hostDoEndOfTurnIfEveryoneIsReady() {
    if (isEveryoneReadyForEndOfTurn()) {
        cleanUpColonySelections(colonySelections);

        // NOTE: Pick a random number that fits into 32 bits
        const randomSeed = Math.floor(Math.random() * 0xFFFFFFFF);
        sendEndOfTurn(randomSeed);

        // The turn is truly ended, and now we're going to watch the turn happen.
        changeUIMode("watchingTurnHappen", {randomSeed});

        return true;
    } else {
        return false;
    }
}


/*
 * Given a gameState and hexSize, this determines the [x,y] dimensions of the entire board
 * (in pixels).
 */
function gameBoardDimensions(gameState, hexSize) {
    const hexesTall = gameState.terrainGrid.length;
    const hexesWide = gameState.terrainGrid[0].length;
    const pixelsWide = hexSize * (hexesWide + 1/2);
    const hexHeight = hexSize * 3 / (2 * Math.sqrt(3));
    const pixelsTall = hexHeight * (hexesTall + 1/3);
    return [pixelsWide, pixelsTall];
}


/*
 * Call this after the board has changed in size.
 */
function onBoardResize() {
    const gameCanvasElem = document.getElementById("game-canvas");
    const screenDims = gameBoardDimensions(displayedGameState, hexSize);
    gameCanvasElem.width = screenDims[0];
    gameCanvasElem.height = screenDims[1];
}


/*
 * This is called when the user clicks on the canvas. It is passed the [x,y]
 * pixel coordinates of the spot clicked on.
 */
function onCanvasClick(pixelCoord) {
    const gridCoord = hexClicked(displayedGameState, hexSize, pixelCoord)
    uiMode.onClickHex(gridCoord, uiModeData);
}


/*
 * This is called before we begin to set up the initial game position. It modifies the global
 * gameState.
 */
function initializeStartingPosition() {
    const startingTerrainGrid = [
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
          [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6],
        [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 4, 1, 2],
          [2, 1, 1, 1, 4, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 4, 1, 2],
        [2, 1, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 2],
          [2, 1, 1, 4, 4, 1, 5, 1, 1, 1, 1, 1, 1, 1, 4, 2, 4, 2],
        [2, 1, 4, 4, 4, 4, 5, 5, 1, 1, 2, 2, 1, 1, 2, 4, 4, 2],
          [2, 4, 5, 4, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 4, 5, 1, 2],
        [2, 2, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 2],
          [2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 5, 4, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const startingColonies = [
        {  eggs:[
                {"numberOfEggs": 1, "location": [2, 7], "daysToHatch": 3},
                {"numberOfEggs": 2, "location": [6, 5], "daysToHatch": 3},
                {"numberOfEggs": 3, "location": [6, 6], "daysToHatch": 3},

            ],

            ants: [
                {location: [4, 3], facing: 7, cast: "Soldier", numberOfAnts: 3, "foodHeld": 0},
                {location: [4, 5], facing: 6, cast: "Queen",   numberOfAnts: 2, "foodHeld": 0},
                {location: [5, 6], facing: 1, cast: "Worker",  numberOfAnts: 2, "foodHeld": 0},
                {location: [2, 8], facing: 5, cast: "Worker",  numberOfAnts: 5, "foodHeld": 0},
                {location: [2, 8], facing: 1, cast: "Queen",   numberOfAnts: 3, "foodHeld": 0},
                {location: [2, 8], facing: 5, cast: "Larva",   numberOfAnts: 2, "foodHeld": 0},
                {location: [2, 8], facing: 3, cast: "Soldier", numberOfAnts: 3, "foodHeld": 0},
                {location: [7, 6], facing: 2, cast: "Larva",   numberOfAnts: 3, "foodHeld": 0},
            ],
            foodSupply: 200,
            antColor: "#000000",
        },
        {
            eggs: [],
            ants: [
                {location: [14, 7], facing: 1, cast: "Worker",  numberOfAnts: 2, "foodHeld": 0},
                {location: [ 6, 6], facing: 1, cast: "Worker",  numberOfAnts: 2, "foodHeld": 0},
                {location: [15, 6], facing: 1, cast: "Queen",   numberOfAnts: 1, "foodHeld": 0},
                {location: [15, 8], facing: 1, cast: "Soldier", numberOfAnts: 4, "foodHeld": 0},
                {location: [15, 7], facing: 0, cast:"Larva",    numberOfAnts: 1, "foodHeld": 0},
            ],
            foodSupply: 500,
            antColor: "#750D06",
        },
    ];
    const startingFoodItems = [
        {
            "appearance": "BasicParticle",
            "location": [9,2],
            "foodValue": 10,
        },
    ];
    startOfTurnGameState = {
        terrainGrid: startingTerrainGrid,
        colonies: startingColonies,
        foodItems: startingFoodItems,
    };
    displayedGameState = structuredClone(startOfTurnGameState);
}


/*
 * Call this to begin the game.
 *
 * Arguments:
 *  * newGameSettings - a GameSettings (see dataStructures.js) specifying the conditions
 *        for this game.
 *  * playerNum - specifies which colony is being controlled by this particular
 *        terminal. ALSO, if playerNum === 0 then this is the host; for any other
 *        value it is not the host.
 */
function startGame(newGameSettings, playerNum) {
    // ==== Validate inputs ===
    if (playerNum < 0 || playerNum > 1) {
        throw Error(`Invalid playerNum of ${playerNum}`);
    }
    const myPlayer = newGameSettings.playerList[playerNum];
    if (myPlayer.playerType !== "Human") {
        throw Error(`This server's player is not a human.`);
    }

    // === Set up the global settings ===
    gameSettings = newGameSettings;
    playerColony = playerNum;
    isHostServer = playerNum === 0;

    // ==== Set up button actions ====
    const zoomInBtnElem = document.getElementById("zoom-in-btn");
    zoomInBtnElem.onclick = function() {
        hexSize = hexSize * 1.2;
        onBoardResize();
        render();
    };
    const zoomOutBtnElem = document.getElementById("zoom-out-btn");
    zoomOutBtnElem.onclick = function() {
        hexSize = hexSize / 1.2;
        onBoardResize();
        render();
    };
    const colonyInfoCollapseBtnElem = document.getElementById("colony-info-collapse");
    colonyInfoCollapseBtnElem.onclick = function() {
        hideElemById("colony-info-data");
        showElemById("colony-info-expand");
    }
    const colonyInfoExpandBtnElem = document.getElementById("colony-info-expand");
    colonyInfoExpandBtnElem.onclick = function() {
        hideElemById("colony-info-expand");
        showElemById("colony-info-data");
    }

    // === Set up canvas interaction actions ===
    const canvas = document.getElementById("game-canvas");
    canvas.addEventListener("click", function(event) {
        const pixelCoord = [event.offsetX, event.offsetY];
        onCanvasClick(pixelCoord);
    });

    // ==== Prepare Game Start ====
    initializeStartingPosition();
    onBoardResize();
    startNewTurn();
    render();
}


function onSinglePlayerLoad() {
    const gameSettings = {
        gameCode: "00000", // special dummy code for single player games
        map: "map1",
        rules: "rules1",
        playerList: [
            { playerType: "Human", username: "Me" },
            { playerType: "AI", username: "RandomRobot", aiType: "RandomMover" },
        ],
    };
    const playerNum = 0; // in a single-player game we are always the host
    startGame(gameSettings, playerNum);
}
