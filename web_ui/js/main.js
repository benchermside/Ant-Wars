/*
 * This contains the code to bootstrap the game (and some test scenarios).
 */

/* ========= Global Variables ========= */
let hexSize = 20;
let gameState = {
    terrainGrid: [],
    ants: [],
};


/* ========= Functions ========= */

/*
 * Call this to re-draw all the game graphics.
 */
const render = function() {
    const gameCanvasElem = document.getElementById("game-canvas");
    const drawContext = gameCanvasElem.getContext("2d");
    drawContext.clearRect(0, 0, gameCanvasElem.width, gameCanvasElem.height);
    drawBackground(drawContext, gameState.terrainGrid, hexSize);
}

/*
 * Call this to make the turn end and render the new update.
 */
const endTurn = function() {
    // === For each ant, select a random allowed destination to move to ===
    const actionSelection = [];
    for(let antNumber = 0; antNumber < gameState.ants.length; antNumber++) {
        const moveLocations = possibleMoves(gameState, antNumber);
        const randomMove = moveLocations[Math.floor(Math.random() * moveLocations.length)];
        const action = {
            name: "Move",
            destination: randomMove
        };
        actionSelection.push(action);
    }

    // === Perform the moves ===
    gameState = applyRules(gameState, actionSelection);

    // === Render the screen ===
    render();
}


/*
 * This is called before we begin to set up the initial game position.
 */
const initializeStartingPosition = function() {
    const startingTerrainGrid = [
        [3, 3, 3, 3, 3, 3],
        [2, 1, 1, 1, 2, 1],
        [2, 2, 1, 1, 1, 1],
        [2, 2, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0],
    ];
    gameState.terrainGrid = startingTerrainGrid;
    const startingAnts = [
        {"location": [4, 3]}
    ];
    gameState.ants = startingAnts;
}


/* ========= Run Stuff On Load ========= */

window.onload = function() {
    // ==== Set up button actions ====
    const zoomInBtnElem = document.getElementById("zoom-in-btn");
    zoomInBtnElem.onclick = function() {
        hexSize = hexSize * 1.2;
        render();
    };
    const zoomOutBtnElem = document.getElementById("zoom-out-btn");
    zoomOutBtnElem.onclick = function() {
        hexSize = hexSize / 1.2;
        render();
    };
    const endTurnBtnElem = document.getElementById("end-turn-btn");
    endTurnBtnElem.onclick = endTurn;

    // ==== Prepare Game Start ====
    initializeStartingPosition();
    const gameContentElem = document.getElementById("game-content");
    const gameCanvasElem = document.getElementById("game-canvas");
    const contentBorderWidth = parseInt((getComputedStyle(gameContentElem)["borderWidth"]));
    gameCanvasElem.width = gameContentElem.offsetWidth - 2 * contentBorderWidth;
    gameCanvasElem.height = gameContentElem.offsetHeight - 2 * contentBorderWidth;
    hexSize = gameCanvasElem.width / 7;
    render();
}
