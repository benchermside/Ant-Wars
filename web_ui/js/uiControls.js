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
    clearNewStackButton();
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
    const lastStack = stacks.item(stacks.length - 1);
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

        // update the new stack button if needed
        if (source === lastStack && source.children.length < 2) {
            clearNewStackButton();
        }
        if (dest === lastStack && dest.children.length === 2) {
            placeNewStackButton(rowOfStacks);
        }
    } else if (stacks.length > 2 && source === lastStack && source.children.length === 1) {
        // special case: we can move it, but that will eliminate the last stack
        // --- move it ---
        removeItemFromStack(source);
        addItemToStack(dest);

        // --- remove stuff ---
        rowOfStacks.removeChild(rowOfStacks.lastChild); // remove last stack
        rowOfStacks.removeChild(rowOfStacks.lastChild); // remove last betweenStackControls

        // --- add newStack button (we're clearly eligible) ---
        placeNewStackButton(rowOfStacks);
    } else {
        // in all other cases, we just aren't allowed to move it, so we do nothing
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
    topArrow.appendChild(document.createTextNode(String.fromCodePoint(0x21C0)));
    topArrow.onclick = () => splitterArrowFunc(rowOfStacks, comesAfter, true);
    newControls.appendChild(topArrow);
    const bottomArrow = document.createElement("button");
    bottomArrow.classList.add("control");
    bottomArrow.appendChild(document.createTextNode(String.fromCodePoint(0x21BD)));
    bottomArrow.onclick = () => splitterArrowFunc(rowOfStacks, comesAfter, false);
    newControls.appendChild(bottomArrow);
    rowOfStacks.appendChild(newControls);
}

/*
 * This adds the button for creating a new stack.
 */
function placeNewStackButton(rowOfStacks) {
    const newStackArrow = document.createElement("button");
    newStackArrow.classList.add("control");
    newStackArrow.setAttribute("id", "new-stack");
    newStackArrow.appendChild(document.createTextNode(String.fromCodePoint(0x21C0)));
    newStackArrow.onclick = () => {
        clearNewStackButton();
        const stacks = rowOfStacks.getElementsByClassName("stack");
        const comesAfter = stacks.length - 1;
        addBetweenStackControls(rowOfStacks, comesAfter);
        addStack(rowOfStacks);
        splitterArrowFunc(rowOfStacks, comesAfter, true); // move one item
    };
    rowOfStacks.appendChild(newStackArrow);
}

/*
 * This removes the new stack button if it exists.
 */
function clearNewStackButton() {
    const newStack = document.getElementById("new-stack");
    if (newStack) {
        newStack.remove();
    }
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
 * numberOfAnts - the number of ants in the pile being split.
 * onDone a function that will be called if the user completes successfully and chooses to split
 * the stack. That function will be passed an array of numbers, each telling how many ants go
 * in a corresponding stack.
 */
function showSplitter(numberOfAnts, onDone) {
    const firstStack = Math.ceil(numberOfAnts / 2)
    const splits = [firstStack, numberOfAnts - firstStack]; // Initial split: close-to-even in 2 stacks

    const splitter = document.getElementById("splitter");
    const rowOfStacks = splitter.getElementsByClassName("row-of-stacks").item(0);
    const stacks = rowOfStacks.getElementsByClassName("stack");

    // --- show the splitter ---
    splitter.classList.remove("hidden");

    // --- clear out children of rowOfStacks to get a clean slate ---
    while (rowOfStacks.lastChild) {
        rowOfStacks.removeChild(rowOfStacks.lastChild);
    }

    // --- create the initial layout of stacks ---
    splits.forEach((numItems, stackNum) => {
        if (stackNum !== 0) {
            addBetweenStackControls(rowOfStacks, stackNum - 1);
        }
        addStack(rowOfStacks);
        for (let i = 0; i < numItems; i++) {
            addItemToStack(stacks.item(stackNum));
        }
    });

    // --- add the new-stack button ---
    if (splits[splits.length - 1] >= 2) {
        placeNewStackButton(rowOfStacks);
    }

    // --- set the behavior of the "Split" button ---
    document.getElementById("splitterFinished").onclick = function() {
        const splitter = document.getElementById("splitter");
        const rowOfStacks = splitter.getElementsByClassName("row-of-stacks").item(0);
        const stacks = rowOfStacks.getElementsByClassName("stack");

        // build the list of new stack counts
        const newStackCounts = [];
        for (let stackNum = 0; stackNum < stacks.length; stackNum++) {
            newStackCounts.push(stacks.item(stackNum).children.length);
        }

        // call the function that was provided to us
        onDone(newStackCounts);
    };
}

function hideSplitter() {
    document.getElementById("splitter").classList.add("hidden");
}


/*
 * This is called once early in game startup. It sets up the animationStages control.
 */
function initializeAnimationStages() {
    const animationStagesElem = document.getElementById("animation-stages");
    const stagesBarElem = animationStagesElem.getElementsByClassName("bar").item(0);
    for (let stageNum = 0; stageNum <= 12; stageNum++) {
        const stageElem = document.createElement("div");
        stageElem.setAttribute("id", `stage-${stageNum}`);
        stageElem.classList.add("stage");
        stageElem.addEventListener("click", (event) => {
            // FIXME: Need to make sure we never go later than the latest stage we ever computed

            // --- Restart the animation from where we left it ---
            if (stageNum === animationState.stage) {
                // --- Clicked the one we're on: switch to "Replaying" slowly ---
                changeAnimationProgression("Replaying");
            } else {
                // --- Clicked some other one: go there and be "Paused" ---
                if (stageNum === 0) {
                    animationState.stage = 0;
                    animationState.substage = "Interacting";
                } else {
                    animationState.stage = stageNum - 1;
                    animationState.substage = "After";
                }
                // FIXME: This won't work unless I do something to reset the random number generator. It needs to support fork().
                // FIXME: I need to reset animationState.randomNumberSource somehow
                // FIXME: I need to reset animationState.interactions somehow
                changeAnimationProgression("Paused");
            }
        });
        stagesBarElem.appendChild(stageElem);
    }

    const nextTurnBtnElem = document.getElementById("next-turn-btn");
    nextTurnBtnElem.addEventListener("click", () => {
        changeAnimationProgression("Rushing");
    });
}


/*
 * Called during each render(), this will correctly highlight the current animation stage. animationStage contains
 * the current state of the animation (which might be null).
 */
function updateAnimationStages(animationState) {
    const animationStagesElem = document.getElementById("animation-stages");
    if (animationState === null) {
        animationStagesElem.classList.add("hidden");
    } else {
        animationStagesElem.classList.remove("hidden");
        const oldActiveStageElem = document.getElementById("active-stage");
        if (oldActiveStageElem !== null) {
            oldActiveStageElem.remove();
        }
        // --- position the turn marker ---
        const activeStageId = `stage-${animationState.stage}`;
        const stageElem = document.getElementById(activeStageId);
        const activeStageElem = document.createElement("div");
        activeStageElem.setAttribute("id", "active-stage");
        stageElem.appendChild(activeStageElem);
    }
}


/*
 * This is passed a uiControls (see dataStructures.js) and it proceeds to display
 * those controls.
 */
function setUIControls(uiControls) {
    const actionButtons = uiControls.actionButtons ? uiControls.actionButtons : [];
    setActionButtons(actionButtons);

    if(uiControls.splitter) {
        showSplitter(
            uiControls.splitter.numberOfAnts,
            uiControls.splitter.onDone,
        );
    } else {
        hideSplitter();
    }

    const animationStagesElem = document.getElementById("animation-stages");
    if (uiControls.showAnimationStages === true) {
        animationStagesElem.classList.remove("hidden");
    } else {
        animationStagesElem.classList.add("hidden");
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
    updateAnimationStages(animationState);
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

    // Reset the list of action buttons
    setActionButtons(uiMode.actionButtons(uiModeData));
    setUIControls(uiMode.uiControls(uiModeData));
}
