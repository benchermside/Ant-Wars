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
    // --- clear the variable we keep ---
    availableGameData.length = 0;

    // --- clear games shown in the panel ---
    const tableElem = document.getElementById("multi-games-widget");
    const oldTBodyElem = tableElem.getElementsByTagName('tbody')[0];
    const newTBodyElem = document.createElement('tbody');
    tableElem.replaceChild(newTBodyElem, oldTBodyElem);

    // --- display length zero ---
    hideElemById("multi-games-widget");
    showElemById("zero-games-widget");
}


/*
 * This is passed the data on a new game to join (an object with fields "gameCode", "hostUsename",
 * "map", and "rules") and it adds that game to the list displayed in the games panel.
 */
function addGameToGamePanel(gameData) {
    let alreadyInList = false;
    availableGameData.forEach(aGameData => {
        if (aGameData.gameCode === gameData.gameCode) {
            alreadyInList = true;
        }
    });

    if (!alreadyInList) {
        // --- if we're adding the FIRST one, switch from displaying "no items" to displaying the table ---
        if (availableGameData.length === 0) {
            hideElemById("zero-games-widget");
            showElemById("multi-games-widget");
        }

        // --- add it to the array we keep ---
        availableGameData.push(gameData);

        // --- add it to the list ---
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
}


/*
 * This is called when we need to refresh the data in the find-game-panel.
 */
function refreshFindGamePanel() {
    // --- clear out the game code ---
    document.getElementById("game-code-field").value = "";

    // --- we just arrived, so clear the game panel ---
    clearGamePanel();

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
    const offeredGameCode = document.getElementById("offered-game-code-field").value;
    const isPrivateGame = document.getElementById("is-private-field").checked;

    if (!isPrivateGame) {
        const messageBody = {
            event: "announceNewGame",
            gameData: {
                gameCode: `${offeredGameCode}`,
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


/*
 * This returns a random GameId. Right now, GameIds are 5-digit numbers that do not begin with 0.
 */
function pickRandomGameId() {
    return Math.floor( Math.random() * (100000 - 10000) + 10000 );
}

/* ========= Socket Listeners ========= */

/*
 * This gets invoked whenever a message arrives over the websocket. What it does (other than logging) will
 * be controlled by the global variable, "socketListener".
 */
function onReceiveMessage(event) {
    console.log("Received websocket message", event, "dispatching to", socketListener); // log incoming messages and handler
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

/* ========= Screen Logic ========= */
// Contains code for declaring "screens". A screen will have behavior when you enter it
// (like showing some elements or setting up a particular socket listener) and behavior
// when you exit it. The function goToScreen() can be called to switch screens. Screens
// are keyed by names.

const screenConfig = {
    pickPlayerCount: {
        // enter: () => {},
        // exit: () => {},
        elementId: "pick-player-count-panel",
    },
    hostOrJoin: {
        elementId: "host-or-join-panel",
    },
    hostGame: {
        elementId: "host-game-panel",
    },
    findGame: {
        enter: refreshFindGamePanel,
        exit: () => {
            socketListener = ignoreEverythingSocketListener;
        },
        elementId: "find-game-panel",
    },
    waitForPlayers: {
        enter: () => {
            document.getElementById("offered-game-code-field").value = pickRandomGameId();
            socketListener = advertisingHostedGameSocketListener;
            announceNewGame();
        },
        exit: () => {
            document.getElementById("offered-game-code-field").value = "";
            socketListener = ignoreEverythingSocketListener;
        },
        elementId: "wait-for-players-panel",
    },
};


/*
 * Call this to go to the given screen.
 */
function goToScreen(screenName) {
    hideElemById(currentScreen.elementId);
    if (currentScreen.exit) {
        currentScreen.exit();
    }
    const newScreen = screenConfig[screenName];
    currentScreen = newScreen;
    if (newScreen.enter) {
        newScreen.enter();
    }
    showElemById(newScreen.elementId);
}


/* ========= Global Constants ========= */
const webSocketEndpoint = "wss://8v29xiw2v8.execute-api.us-east-1.amazonaws.com/production";
const webSocket = new WebSocket(webSocketEndpoint);


/* ========= Global Variables ========= */
let socketListener = ignoreEverythingSocketListener;
const availableGameData = [];
let offeredGameCode = null; // FIXME: This will be a field in the page once I HAVE a page, not a global
let currentScreen = screenConfig["pickPlayerCount"]; // FIXME: Does this really need to be a global variable?

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
        "multi-player-btn": () => {goToScreen("hostOrJoin"); registerPlayerInLobby();},
        "host-or-join-back-btn": () => {goToScreen("pickPlayerCount");},
        "host-game-btn": () => {goToScreen("hostGame");},
        "host-game-back-btn": () => {goToScreen("hostOrJoin");},
        "find-game-btn": () => {goToScreen("findGame");},
        "find-game-back-btn": () => {goToScreen("hostOrJoin");},
        "invite-btn": () => {goToScreen("waitForPlayers");},
        "wait-for-players-back-btn": () => {goToScreen("hostGame")},
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
