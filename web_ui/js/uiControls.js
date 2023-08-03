/*
 * This file contains supporting code for drawing UI controls that live over top of the canvas.
 */



/*
 * This is called with a list of "action buttons" and it displays them.
 *
 * Each button should be an object with fields "label" (a string giving the
 * text to display), and "action" (a function to call when the button is clicked).
 */
function setActionButtons(buttons) {
    const buttonsDivElem = document.getElementById("action-controls");

    // --- Remove existing buttons ---
    while (buttonsDivElem.firstChild) {
        buttonsDivElem.removeChild(buttonsDivElem.lastChild);
    }

    // --- Add new buttons ---
    buttons.forEach(button => {
        const buttonElem = document.createElement("button");
        buttonElem.innerText = button.label;
        buttonElem.addEventListener('click', button.action);
        buttonsDivElem.appendChild(buttonElem);
    });
}


/*
 * Add a new stack to the end of the row-of-stacks.
 */
function addStack(rowOfStacks) {
    const newStack = document.createElement("div");
    newStack.classList.add("stack");
    rowOfStacks.appendChild(newStack);
}


/*
 * The function that will be called by the arrows between stacks. rowOfStacks is the
 * like-named element, comesAfter is the number of the stack these arrows are after,
 * and isTopArrow is true for top arrows and false for bottom ones.
 */
function splitterArrowFunc(rowOfStacks, comesAfter, isTopArrow) {
    const stacks = rowOfStacks.getElementsByClassName("stack");
    let source;
    let dest;
    if (isTopArrow) {
        source = stacks.item(comesAfter);
        dest = stacks.item(comesAfter + 1);
    } else {
        source = stacks.item(comesAfter + 1);
        dest = stacks.item(comesAfter);
    }
    if (source.children.length > 1) { // arrows disabled if there isn't one we can move
        removeItemFromStack(source);
        addItemToStack(dest);
    }
}

/*
 * This creates the controls between the stacks (the arrows that move things back and
 * forth).
 */
function addBetweenStackControls(rowOfStacks, comesAfter) {
    const newControls = document.createElement("div");
    newControls.classList.add("between-stack-controls");
    const topArrow = document.createElement("button");
    topArrow.classList.add("control");
    const topText = document.createTextNode(String.fromCodePoint(0x21C0));
    topArrow.appendChild(topText);
    newControls.appendChild(topArrow);
    const bottomArrow = document.createElement("button");
    bottomArrow.classList.add("control");
    const bottomText = document.createTextNode(String.fromCodePoint(0x21BD));
    topArrow.onclick = () => splitterArrowFunc(rowOfStacks, comesAfter, true);
    bottomArrow.onclick = () => splitterArrowFunc(rowOfStacks, comesAfter, false);
    bottomArrow.appendChild(bottomText);
    newControls.appendChild(bottomArrow);
    rowOfStacks.appendChild(newControls);
}


/*
 * Passed a stackElem, this inserts another item on the stack.
 */
function addItemToStack(stack) {
    const newItem = document.createElement("div");
    newItem.classList.add("item");
    const text = document.createTextNode(String.fromCodePoint(0x1F41C));
    newItem.appendChild(text);
    stack.appendChild(newItem);
}


/*
 * Passed a stackElem this removes one item from the stack.
 */
function removeItemFromStack(stack) {
    stack.removeChild(stack.lastChild);
}



/*
 * Display a splitter for the given number of ants.
 *
 * // FIXME: It also needs an arrow for creating new stacks.
 * // FIXME: It will also need an action to take after entering data!
 */
function showSplitter(numberOfAnts) {
    const splits = [numberOfAnts - 1, 1]; // Initial split: all but one in first stack; 1 in second stack

    const splitter = document.getElementById("splitter");
    const rowOfStacks = splitter.getElementsByClassName("row-of-stacks").item(0);
    const stacks = rowOfStacks.getElementsByClassName("stack");

    // --- show the splitter ---
    splitter.classList.remove("hidden");

    // --- clear out children of rowOfStacks to get a clean slate ---
    while (rowOfStacks.lastChild) {
        rowOfStacks.removeChild(rowOfStacks.lastChild);
    }

    // --- create the first 2 stacks ---
    addStack(rowOfStacks);
    addBetweenStackControls(rowOfStacks, 0);
    addStack(rowOfStacks);

    // --- put in some ants ---
    splits.forEach((numItems, stackNum) => {
        for (let i = 0; i < numItems; i++) {
            addItemToStack(stacks.item(stackNum));
        }
    });
}

function hideSplitter() {
    document.getElementById("splitter").classList.add("hidden");
}



/*
 * This is passed a uiControls (see dataStructures.js) and it proceeds to display
 * those controls.
 */
function setUIControls(uiControls) {
    const actionButtons = uiControls.actionButtons ? uiControls.actionButtons : [];
    setActionButtons(actionButtons);

    if(uiControls.splitter) {
        showSplitter(uiControls.splitter.numberOfAnts);
    } else {
        hideSplitter();
    }
}


/*
 * This is called to re-draw all the on-screen controls done in HTML rather than
 * on the canvas.
 */
function updateControls() {
    document.getElementById("show-foodSupply").value = displayedGameState.colonies[playerColony].foodSupply;
    const upkeep = displayedGameState.colonies[playerColony].ants.reduce(
        (sum, ant) => sum + ant.numberOfAnts * rules.costs.upkeepCost[ant.cast],
        0
    );
    document.getElementById("show-upkeep").value = upkeep;
}



/*
 * This is called to change the UIMode. It is the only place that is allowed to change the global
 * variable uiMode. The first parameter must be a sting which is a field in uiModes identifying
 * the mode to enter. The second parameter is optional -- if provided it should be an object
 * which will be used as the uiModeData.
 */
function changeUIMode(newUIMode, data) {
    // Exit the existing mode
    if (uiMode !== null) {
        uiMode.exitMode(uiModeData);
    }

    // Reset the data
    uiModeData = data === undefined ? {} : data;

    // Assign to the global variable uiMode
    uiMode = uiModes[newUIMode];
    if (uiMode === undefined) {
        throw new Error(`changeUIMode() called with invalid mode ${newUIMode}.`);
    }

    // Enter the new mode
    uiMode.enterMode(uiModeData);

    // FIXME: Replace this
    // Reset the list of action buttons
    setActionButtons(uiMode.actionButtons(uiModeData));
    setUIControls(uiMode.uiControls(uiModeData));
}
