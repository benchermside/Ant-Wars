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
 */
function playingGameSocketListener(messageData) {
    // FIXME: Need code here
    console.log("playingGameSocketListener got", messageData);
}


/*
 * Call this to join the game (and leave any previous "game" like the lobby).
 * Pass in the gameCode of the game being joined. All this does is to tell the
 * socket to send messages related to this gameCode.
 */
function registerInNewGame(username, gameCode) {
    const message = {action: "setGame", gameId: `ant-war:g:${gameCode}`, playerId: username};
    const messageAsText = JSON.stringify(message);
    webSocket.send(messageAsText);
    console.log("Sending", message); // Log the message
}


/*
 * Call this when a player who is NOT the host hits the button to submit their moves. It
 * sends an "announceColonySelections" message (see messages.txt) to tell the host what
 * the ColonySelections are.
 */
function announceColonySelections(actionSelections) {
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
