/*
 * This contains the code to bootstrap the game (and some test scenarios).
 */

/* ========= Global Variables ========= */
let hexSize = 120; // starting size
let gameState = null; // will be populated during initialization
let highlightedHex = null; // will always be the [x,y] coordinate of a cell OR null
let indicatedHexes = []; // list of [x,y] coordinates to mark
let playerColony = 0; // which colony (by number) the current player is running
let uiMode = null;
let playerActionSelections = null;


/* ========= Functions ========= */

/*
 * Call this to re-draw all the game graphics.
 */
function render() {
    const gameCanvasElem = document.getElementById("game-canvas");
    const drawContext = gameCanvasElem.getContext("2d");
    drawContext.clearRect(0, 0, gameCanvasElem.width, gameCanvasElem.height);
    drawBackground(drawContext, gameState.terrainGrid, hexSize);
    if (highlightedHex !== null) {
        highlightHex(drawContext, hexSize, highlightedHex);
    }
    indicatedHexes.forEach(coord => indicateHex(drawContext, hexSize, coord));
    drawItems(drawContext, gameState, hexSize);
}


/*
 * This sets up to begin a new turn.
 */
function startNewTurn() {
    // Set all ant startLocations to their current locations:
    gameState.colonies.forEach(colony => {
        colony.ants.forEach(ant => {
            ant.startLocation = ant.location;
        });
    });

    // begin with all ants having "null" for a move
    playerActionSelections = gameState.colonies[playerColony].ants.map(() => null);

    // begin with the end-turn button disabled
    disableEndTurnButton();

    // begin in readyToEnter uiMode.
    uiMode = readyToEnterMoves;
}


/*
 * Call this to make the turn end and render the new update.
 */
function endTurn() {
    // === When the turn ends, clear any UI interaction in progress ===
    highlightedHex = null;

    // === For each ant, select a random allowed destination to move to ===
    const colonySelections = gameState.colonies.map((colony, colonyNumber) => {
        if (colonyNumber === playerColony) {
            // The player entered moves (probably). Replace any null with the do-nothing action, then use it.
            const actionSelections = playerActionSelections.map(actionSelection =>
                actionSelection === null ? {"name": "None"} : actionSelection
            );
            return {actionSelections: actionSelections};
        } else {
            // this is not the player. Select random moves
            const actionSelections = colony.ants.map((antState, antNumber) => {
                const moveLocations = possibleMoves(gameState, colonyNumber, antNumber);
                const randomMove = moveLocations[Math.floor(Math.random() * moveLocations.length)];
                return {name: "Move", destination: randomMove};
            });
            return {actionSelections: actionSelections};
        }
    });

    // === Perform the moves ===
    gameState = applyRules(gameState, colonySelections);
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
    const screenDims = gameBoardDimensions(gameState, hexSize);
    gameCanvasElem.width = screenDims[0];
    gameCanvasElem.height = screenDims[1];
}


/*
 * This is called when the user clicks on the canvas. It is passed the [x,y]
 * pixel coordinates of the spot clicked on.
 */
function onCanvasClick(pixelCoord) {
    const gridCoord = hexClicked(gameState, hexSize, pixelCoord)
    uiMode.onClickHex(gridCoord);
}

/*
 * Call this to disable the end-turn button because not all ants have orders yet.
 */
function disableEndTurnButton() {
    document.getElementById("end-turn-btn").disabled = true;

}

/*
 * Call this to enable the end-turn button when all ants have orders.
 */
function enableEndTurnButton() {
    document.getElementById("end-turn-btn").disabled = false;
}


/*
 * This is called before we begin to set up the initial game position. It modifies the global
 * gameState.
 */
function initializeStartingPosition() {
    const startingTerrainGrid = [
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
          [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 2],
          [2, 1, 1, 1, 4, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2],
        [2, 1, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
          [2, 1, 1, 4, 4, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2],
        [2, 1, 4, 4, 4, 4, 5, 5, 1, 1, 2, 2, 1, 1, 2, 1, 1, 2],
          [2, 4, 5, 4, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
        [2, 2, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
          [2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const startingColonies = [
        {
            ants: [
                {location: [2, 3], facing: 7, cast: "Soldier"},
                {location: [4, 5], facing: 3, cast: "Queen"},
            ],
            foodSupply: 20,
            antColor: "#000000",
        },
        {
            ants: [
                {location: [14,7],facing: 1, cast: "Worker" },
                {location: [15, 6], facing: 1, cast: "Queen"},
                {location: [15, 8], facing: 1, cast: "Soldier"},
            ],
            foodSupply: 50,
            antColor: "#750D06",
        },
    ];
    // starting location = location for all ants:
    startingColonies.forEach(colony => {
        colony.ants.forEach(ant => {
            ant.startLocation = ant.location;
        });
    });
    gameState = {
        terrainGrid: startingTerrainGrid,
        colonies: startingColonies,
    }
}


/* ========= Run Stuff On Load ========= */

window.addEventListener("load", function() {
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
    const endTurnBtnElem = document.getElementById("end-turn-btn");
    endTurnBtnElem.onclick = function() {
        endTurn();
        startNewTurn();
        render();
    };

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
});
