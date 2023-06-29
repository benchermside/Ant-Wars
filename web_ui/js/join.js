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
    document.getElementById("single-player-btn").onclick = function() {
        window.location.href = "/index.html";
    };
    document.getElementById("multi-player-btn").onclick = function() {
        document.getElementById("pick-player-count-panel").classList.add("hidden");
        document.getElementById("host-or-join-panel").classList.remove("hidden");

    };
    document.getElementById("host-game-btn").onclick = function() {
        document.getElementById("host-or-join-panel").classList.add("hidden");
        document.getElementById("host-game-panel").classList.remove("hidden");
    };

    // === Set up other actions ===
    document.getElementById("username-field").addEventListener("input", function(e) {
        const username = e.target.value;
        document.getElementById("multi-player-btn").disabled = !isValidUsername(username);
    });
});
