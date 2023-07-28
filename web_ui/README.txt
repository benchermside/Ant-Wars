Ant-War Web UI

This is a set of html, css, and javascript files which can be hosted (currently hosted on AWS and available at
"https://ant-war.com") to run the Ant-War game.

To run it locally, you will need a web server. One easy way to do that is to get a command line in the
Ant-Wars/web_ui directory and run this command:

> python -m http.server

That should start a web server on port 8000. Then visit port 8000 with a browser to run the game. Python is
not required -- any simple web server should do. A single-player version plays against a (rather dumb!) AI
with a default map and ruleset; the multi-player version allows one player to host a game and another to join
it for a cross-browser multi-player game.
