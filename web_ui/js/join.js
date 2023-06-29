/*
 * Contains code supporting the process of joining a game.
 */

/* ========= Functions ========= */

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

/* ========= Run Stuff On Load ========= */

window.addEventListener("load", function() {
    // ==== Set up button actions ====
    function hide(id) {
        document.getElementById(id).classList.add("hidden");
    }
    function show(id) {
        document.getElementById(id).classList.remove("hidden");
    }
    const buttonActions = {
        "single-player-btn": () => {window.location.href = "/index.html";},
        "multi-player-btn": () => {hide("pick-player-count-panel"); show("host-or-join-panel");},
        "host-or-join-back-btn": () => {hide("host-or-join-panel"); show("pick-player-count-panel");},
        "host-game-btn": () => {hide("host-or-join-panel"); show("host-game-panel");},
        "host-game-back-btn": () => {hide("host-game-panel"); show("host-or-join-panel");},
        "join-game-btn": () => {hide("host-or-join-panel"); show("join-game-panel");},
        "join-game-back-btn": () => {hide("join-game-panel"); show("host-or-join-panel");},
    };
    for (const btnName in buttonActions) {
        document.getElementById(btnName).onclick = buttonActions[btnName];
    }

    // === Set up other actions ===
    document.getElementById("username-field").addEventListener("input", function(e) {
        const username = e.target.value;
        document.getElementById("multi-player-btn").disabled = !isValidUsername(username);
    });
});
