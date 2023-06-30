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
    const usernameRegex = /^[A-Za-z]+$/
    return usernameRegex.test(username);
}

/*
 * This removes all displayed games from the game panel.
 */
function clearGamePanel() {
    availableGameData.length = 0;
    // --- update the panel ---
    // FIXME: Should deal with empty list!
    const tableElem = document.getElementById("multi-games-widget");
    const oldTBodyElem = tableElem.getElementsByTagName('tbody')[0];
    const newTBodyElem = document.createElement('tbody');
    tableElem.replaceChild(newTBodyElem, oldTBodyElem);
}


/*
 * This is passed the data on a new game to join (an object with fields "gameCode", "hostUsename",
 * "map", and "rules") and it adds that game to the list displayed in the games panel.
 */
function addGameToGamePanel(gameData) {
    // FIXME: Need to check for duplicates and not add them
    availableGameData.push(gameData); // add it to the array we keep
    const tBodyElem = document.getElementById("multi-games-widget").getElementsByTagName('tbody')[0];
    const rowElem = tBodyElem.insertRow();
    rowElem.innerHTML = `<tr>` +
        `<td><input type="radio" name="game" value="${gameData.gameCode}" class="game-select"></td>` +
        `<td>${gameData.hostUsername}</td>` +
        `<td>${gameData.map}</td>` +
        `<td>${gameData.rules}</td>` +
        `</tr>`;
    rowElem.getElementsByClassName("game-select")[0].addEventListener("change", () => {
        document.getElementById("game-code-field").value = gameData.gameCode;
        document.getElementById("join-game-btn").disabled = false;
    });
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
        clearGamePanel();
        availableGameData.forEach(addGameToGamePanel);
        showElemById("multi-games-widget");
        hideElemById("zero-games-widget");
    }
}


/*
 * This is called when we need to refresh the data in the find-game-panel.
 */
function refreshFindGamePanel() {
    // FIXME: Need to handle the case of zero games.
    [
        { gameCode: "87433", hostUsername: "mcherm", map: "Default Map", rules: "Default Rules", },
        { gameCode: "53902", hostUsername: "grapefruit", map: "Default Map", rules: "Default Rules", },
        { gameCode: "66839", hostUsername: "melissa", map: "Other Map", rules: "Default Rules", },
    ].forEach(gameData => availableGameData.push(gameData));
    populateGameChooser(availableGameData);

    // --- start listening for new games that get announced ---
    socketListener = displayLobbyGamesSocketListener;

    // --- send message requesting that games on offer list themselves ---
    const messageBody = {event: "requestListOfGames"};
    const fullMessage = {action: "sendMessage", gameId: "ant-war:lobby", data: messageBody};
    const messageAsText = JSON.stringify(fullMessage);
    webSocket.send(messageAsText);
    console.log("Sending", fullMessage); // Log the message
}


/*
 * This is called when you first claim a username and enter the lobby. NOTE: the current version
 * doesn't do anything to prevent two people from claiming the same username, which could cause
 * issues. Changing that is probably a server-side fix replacing or extending the WebSocket
 * library I'm using.
 */
function registerPlayerInLobby() {
    const username = document.getElementById("username-field").value;
    const message = {action: "setGame", gameId: "ant-war:lobby", playerId: username};
    const messageAsText = JSON.stringify(message);
    webSocket.send(messageAsText);
    console.log("registered player in lobby", message);
}


/*
 * Announce to the lobby that we have a new game available to join. It actually WON'T be announced
 * if the game is private.
 */
function announceNewGame() {
    const username = document.getElementById("username-field").value;
    const selectedMap = document.getElementById("pick-map-field").value;
    const selectedRules = document.getElementById("pick-rules-field").value;
    const isPrivateGame = document.getElementById("is-private-field").checked;

    if (!isPrivateGame) {
        const messageBody = {
            event: "announceNewGame",
            gameData: {
                gameCode: "ant-war:87433",
                hostUsername: username,
                map: selectedMap,
                rules: selectedRules,
            },
        };
        const fullMessage = {action: "sendMessage", gameId: "ant-war:lobby", data: messageBody};
        const messageAsText = JSON.stringify(fullMessage);
        webSocket.send(messageAsText);
        console.log("Sending", fullMessage); // Log the message
    }
}

/* ========= Socket Listeners ========= */

/*
 * This gets invoked whenever a message arrives over the websocket. What it does (other than logging) will
 * be controlled by the global variable, "socketListener".
 */
function onReceiveMessage(event) {
    console.log("Received websocket message", event);
    socketListener(JSON.parse(event.data));
}

function ignoreEverythingSocketListener(messageData) {
}

function displayLobbyGamesSocketListener(messageData) {
    if (messageData.event === "announceNewGame") {
        addGameToGamePanel(messageData.gameData);
    }
}

function advertisingHostedGameSocketListener(messageData) {
    if (messageData.event === "requestListOfGames") {
        announceNewGame();
    }
}


/* ========= Global Constants ========= */
const webSocketEndpoint = "wss://8v29xiw2v8.execute-api.us-east-1.amazonaws.com/production";
const webSocket = new WebSocket(webSocketEndpoint);


/* ========= Global Variables ========= */
let socketListener = ignoreEverythingSocketListener;
const availableGameData = [];


/* ========= Run Stuff On Load ========= */
window.addEventListener("load", function() {
    // ==== Watch for websocket to be ready ====
    webSocket.addEventListener("open", function() {
        document.getElementById("username-field").disabled = false; // enable entering usernames
    });
    webSocket.addEventListener("message", onReceiveMessage);

    // ==== Set up button actions ====
    const buttonActions = {
        "single-player-btn": () => {window.location.href = "/index.html";},
        "multi-player-btn": () => {hideElemById("pick-player-count-panel"); showElemById("host-or-join-panel"); registerPlayerInLobby();},
        "host-or-join-back-btn": () => {hideElemById("host-or-join-panel"); showElemById("pick-player-count-panel");},
        "host-game-btn": () => {hideElemById("host-or-join-panel"); showElemById("host-game-panel");},
        "host-game-back-btn": () => {hideElemById("host-game-panel"); showElemById("host-or-join-panel");},
        "find-game-btn": () => {hideElemById("host-or-join-panel"); showElemById("find-game-panel"); refreshFindGamePanel(); },
        "find-game-back-btn": () => {hideElemById("find-game-panel"); showElemById("host-or-join-panel");},
        "invite-btn": () => { socketListener = advertisingHostedGameSocketListener; announceNewGame(); },
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
