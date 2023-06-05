/*
 * This contains the code to bootstrap the game (and some test scenarios).
 */

window.onload = function() {
    let gameContentElem = document.getElementById("game-content");
    let gameCanvasElem = document.getElementById("game-canvas");
    let drawContext = gameCanvasElem.getContext("2d");
    let startingTerrainGrid = [
        [3, 3, 3, 3, 3, 3],
        [2, 1, 1, 1, 2, 1],
        [2, 2, 1, 1, 1, 1],
        [2, 2, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0],
    ];
    gameCanvasElem.width = gameContentElem.offsetWidth;
    gameCanvasElem.height = gameContentElem.offsetHeight;
    let cellSize = gameCanvasElem.width / 7;
    drawBackground(drawContext, startingTerrainGrid, cellSize);
}
