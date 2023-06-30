/*
 * Contains code supporting the process of joining a game.
 */

/* ========= Functions ========= */

function hideElemById(id) {
    document.getElementById(id).classList.add("hidden");
}
function showElemById(id) {
    document.getElementById(id).classList.remove("hidden");
}

/*
 * Returns true if the string "username" is a valid username.
 */
function isValidUsername(username) {
    if (username.length < 1 || username.length > 15) {
        return false;
    }
    const usernameRegex = /^[a-z]+$/
    return usernameRegex.test(username);
}

/*
 * When this is called with data about the active games it populates the table of games
 * to join.
 */
function populateGameChooser(availableGameData) {
    if (availableGameData.length === 0) {
        hideElemById("multi-games-widget");
        showElemById("zero-games-widget");
    } else {
        const tableElem = document.getElementById("multi-games-widget");
        const oldTBodyElem = tableElem.getElementsByTagName('tbody')[0];
        const newTBodyElem = document.createElement('tbody');
        tableElem.replaceChild(newTBodyElem, oldTBodyElem);
        availableGameData.forEach(gameData => {
            const rowElem = newTBodyElem.insertRow();
            rowElem.innerHTML = `<tr>` +
                `<td><input type="radio" name="game" value="${gameData.gameCode}" class="game-select"></td>` +
                `<td>${gameData.hostUsername}</td>` +
                `<td>${gameData.map}</td>` +
                `<td>${gameData.rules}</td>` +
            `</tr>`;
            rowElem.getElementsByClassName("game-select")[0].addEventListener("change", e => {
                document.getElementById("game-code-field").value = gameData.gameCode;
                document.getElementById("join-game-btn").disabled = false;
            });
        });
        showElemById("multi-games-widget");
        hideElemById("zero-games-widget");
    }
}

/*
 * This is called when we need to refresh the data in the find-game-panel.
 */
function refreshFindGamePanel() {
    const availableGameData = [
        { gameCode: "87433", hostUsername: "mcherm", map: "Default Map", rules: "Default Rules", },
        { gameCode: "53902", hostUsername: "grapefruit", map: "Default Map", rules: "Default Rules", },
        { gameCode: "66839", hostUsername: "melissa", map: "Other Map", rules: "Default Rules", },
    ];
    populateGameChooser(availableGameData);
}


/* ========= Run Stuff On Load ========= */

window.addEventListener("load", function() {
    // ==== Set up button actions ====
    const buttonActions = {
        "single-player-btn": () => {window.location.href = "/index.html";},
        "multi-player-btn": () => {hideElemById("pick-player-count-panel"); showElemById("host-or-join-panel");},
        "host-or-join-back-btn": () => {hideElemById("host-or-join-panel"); showElemById("pick-player-count-panel");},
        "host-game-btn": () => {hideElemById("host-or-join-panel"); showElemById("host-game-panel");},
        "host-game-back-btn": () => {hideElemById("host-game-panel"); showElemById("host-or-join-panel");},
        "find-game-btn": () => {hideElemById("host-or-join-panel"); showElemById("find-game-panel"); refreshFindGamePanel(); },
        "find-game-back-btn": () => {hideElemById("find-game-panel"); showElemById("host-or-join-panel");},
    };
    for (const btnName in buttonActions) {
        document.getElementById(btnName).onclick = buttonActions[btnName];
    }

    // === Set up other actions ===
    document.getElementById("username-field").addEventListener("input", function(e) {
        const username = e.target.value.trim();
        document.getElementById("multi-player-btn").disabled = !isValidUsername(username);
    });
    document.getElementById("game-code-field").addEventListener("input", function(e) {
        const gameCode = e.target.value.trim();
        document.getElementById("join-game-btn").disabled = !(gameCode.length > 0);
        // --- uncheck any games selected ---
        const radioElems = document.getElementById("multi-games-widget").getElementsByClassName("game-select");
        for (let i=0; i < radioElems.length; i++) {
            const radioElem = radioElems[i];
            radioElem.checked = false;
        }
    });
});
