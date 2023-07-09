/*
 * This file has code in it for communicating between the servers while playing the game.
 */


/*
 * A function to receive communications when this is the host of the game.
 */
function hostingGameSocketListener(messageData) {
    if (messageData.event === "announceColonySelection") {
        // --- got a message giving a colony's selections ---
        colonySelections[messageData.colonyNumber] = messageData.colonySelection;

        // --- check if that was the last one we were waiting for ---
        hostDoEndOfTurnIfEveryoneIsReady();
    }
}


/*
 * A function to receive communications when this is a player who is NOT the
 * host of the game.
 *
 * Note: This isn't particularly "nice" -- it doesn't just watch for endOfTurn
 * messages in certain modes or at certain times -- ANY time we receive one we
 * dump what we were doing, use the data from the server, and run the end-of-turn.
 * That is because this is not the host and we have to keep in sync with the
 * host. Honestly, we MIGHT need to pass the GameState as well to combat problems
 * with drift... but for now we aren't trying to do that.
 */
function playingGameSocketListener(messageData) {
    if (messageData.event === "endOfTurn") {
        colonySelections = messageData.colonySelections;
        changeUIMode("watchingTurnHappen", {randomSeed: messageData.randomSeed});
    }
}


/*
 * Call this to join the game (and leave any previous "game" like the lobby).
 * Pass in the gameCode of the game being joined. What this does is to tell the
 * socket to send messages related to this gameCode and then to register the
 * proper socket listener.
 *
 * Arguments:
 *  * username - the username of this user
 *  * gameCode - the code for the game we are joining
 *  * isHost - true if this is the host, false if it is not
 */
function registerInNewGame(username, gameCode, isHost) {
    if (isNetworkGame) {
        // --- Join game on server ---
        const message = {action: "setGame", gameId: `ant-war:g:${gameCode}`, playerId: username};
        const messageAsText = JSON.stringify(message);
        webSocket.send(messageAsText);
        console.log("Sending", message); // Log the message

        // --- Set the listener ---
        socketListener = isHost ? hostingGameSocketListener : playingGameSocketListener;
    }
}


/*
 * Call this when a player who is NOT the host hits the button to submit their moves. It
 * sends an "announceColonySelections" message (see messages.txt) to tell the host what
 * the ColonySelections are.
 */
function announceColonySelections(actionSelections) {
    if (isNetworkGame) {
        const gameCode = gameSettings.gameCode;
        const completedActionSelections = completeActionSelections(actionSelections); // fill in any nulls

        const messageBody = {
            event: "announceColonySelection",
            colonyNumber: playerColony,
            colonySelection: {
                isReadyForEndOfTurn: true,
                actionSelections: completedActionSelections,
            },
        };
        const fullMessage = {action: "sendMessage", gameId: `ant-war:g:${gameCode}`, data: messageBody};
        const messageAsText = JSON.stringify(fullMessage);
        webSocket.send(messageAsText);
        console.log("Sending", fullMessage); // Log the message
    }
}


/*
 * This function is called on the host to send the end-of-turn message to all other
 * players.
 *
 * Arguments:
 *  * randomSeed - a 32-bit number which will be used as a seed for the random
 *         number generation during this turn's actions.
 */
function sendEndOfTurn(randomSeed) {
    if (isNetworkGame) {
        const gameCode = gameSettings.gameCode;
        const messageBody = {
            event: "endOfTurn",
            colonySelections: colonySelections,
            randomSeed: randomSeed,
        };
        const fullMessage = {action: "sendMessage", gameId: `ant-war:g:${gameCode}`, data: messageBody};
        const messageAsText = JSON.stringify(fullMessage);
        webSocket.send(messageAsText);
        console.log("Sending", fullMessage); // Log the message
    }
}
