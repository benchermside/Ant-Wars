/*
 * This contains the code to bootstrap the game (and some test scenarios).
 */

/* ========= Global Variables ========= */
let hexSize = 20;
let terrainGrid = [];


/* ========= Functions ========= */
/*
 * Call this to re-draw all the game graphics.
 */
const render = function() {
    const gameCanvasElem = document.getElementById("game-canvas");
    const drawContext = gameCanvasElem.getContext("2d");
    drawContext.clearRect(0, 0, gameCanvasElem.width, gameCanvasElem.height);
    drawBackground(drawContext, terrainGrid, hexSize);
}


/* ========= Run Stuff On Load ========= */

window.onload = function() {
    const zoomInBtnElem = document.getElementById("zoom-in-btn");
    zoomInBtnElem.onclick = function() {
        hexSize = hexSize * 1.2;
        console.log("Zoom", hexSize);
        render();
    };
    const zoomOutBtnElem = document.getElementById("zoom-out-btn");
    zoomOutBtnElem.onclick = function() {
        hexSize = hexSize / 1.2;
        render();
    };

    const gameContentElem = document.getElementById("game-content");
    const gameCanvasElem = document.getElementById("game-canvas");
    const startingTerrainGrid = [
        [3, 3, 3, 3, 3, 3],
        [2, 1, 1, 1, 2, 1],
        [2, 2, 1, 1, 1, 1],
        [2, 2, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0],
    ];
    terrainGrid = startingTerrainGrid;
    const contentBorderWidth = parseInt((getComputedStyle(gameContentElem)["borderWidth"]));
    gameCanvasElem.width = gameContentElem.offsetWidth - 2 * contentBorderWidth;
    gameCanvasElem.height = gameContentElem.offsetHeight - 2 * contentBorderWidth;
    hexSize = gameCanvasElem.width / 7;
    render();
}
