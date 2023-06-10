// ----------- GLOBALS ------------//
const contentContainer = document.querySelector(".content-container");
const diceFacesContainer = document.querySelector(".dice-faces-container");
const diceResultsContainer = document.querySelector(".dice-results-container");

const colorMap = {"d4":"rgb(216,176,0)", "d6":"hsl(120,100.0%,47.1%)"
                , "d8":"rgb(0,240,182)", "d10":"rgb(0,197,255)"
                , "d12":"rgb(182,136,255)", "d20":"rgb(255,93,255)"
                , "dCustom":"rgb(255,92,150)"}

let isRollingMap = new Map();
let rollNum = 0;
let pendingDiceResultTotal = 0;
let diceWidth;



// ----------- RENDER COMPONENTS, ETC. ------ //

function createAndRenderDiceButtons() {

}



// ----------- EVENT LISTENERS ---------- //

window.addEventListener("resize", () => {
    refreshDiceDimensions();
});



// ----------- BUTTON HANDLERS --------- //

function diceButtonClickHandler(button) {
    let buttonId = button.id;
    let diceName = buttonId.substring(0, buttonId.indexOf('-'));
    let newDice = addDiceToContainer(diceName);
    toggleContentToolbar();
    refreshDiceDimensions();
    rollDice(newDice);
}

function diceFaceClickHandler(event) {
    removeDiceFromContainer(event.target);
    toggleContentToolbar();
    refreshDiceDimensions();
}

function rollButtonClickHandler() {
    rollAllDice();
}

function undoButtonClickHandler() {
    removeLastDice();
    toggleContentToolbar();
    refreshDiceDimensions();
}

function clearButtonClickHandler() {
    clearAllDice();
    toggleContentToolbar();
}



// ----------- HELPERS ---------------- //

function refreshDiceDimensions() {
    updateDiceWidth();
    setDiceDimensions();
}



// ----------- DICE SCRIPT ------------ //

// NOTE: implementing SUPER simplified version (no real animation or 3D)
// "Dice roll" animation is rounded square div with quickly changing face value...

function getNumDice() {
    return document.querySelectorAll(".dice-face").length;
}

function addDiceToContainer(diceName) {
    let newDice = document.createElement("div");
    newDice.addEventListener("click", diceFaceClickHandler);
    newDice.classList.add(diceName);
    newDice.classList.add('dice-face');
    newDice.classList.add('didact-font-2rem');
    //newDice.classList.add(diceColorFilter);
    newDice.classList.add('shadow');
    newDice.style.backgroundColor = colorMap[diceName];
    diceFacesContainer.appendChild(newDice);
    isRollingMap.set(newDice, false);
    return newDice;
}

function clearAllDice() {
    isRollingMap.clear();
    diceFacesContainer.textContent = '';
}

function removeLastDice() {
    if (diceFacesContainer.childElementCount === 0) return;
    let diceElement = diceFacesContainer.lastElementChild;
    removeDiceFromContainer(diceElement);
}

function removeDiceFromContainer(diceElement) {
    isRollingMap.delete(diceElement);
    diceElement.remove();
}

function rollAllDice() {
    const diceFaces = document.querySelectorAll(".dice-face");
    for (var diceFace of diceFaces) {
        rollDice(diceFace);
    }
}

function rollDice(diceElement) {
    if (isRollingMap.get(diceElement)) return;
    isRollingMap.set(diceElement, true);
    let cycles = 0;
    diceElement.style.opacity = 0.5;
    setTimeout(function doSomething() {
        if (cycles > 25) {
            isRollingMap.set(diceElement, false);
            diceElement.style.opacity = 1.0;
            addToDiceResults(parseInt(diceElement.innerHTML));
            return;
        }
        setRandomDiceResult(diceElement);
        formatTextResult(diceElement);
        cycles++;
        setTimeout(doSomething, 75);
    }, 75);
}

function setRandomDiceResult(diceElement) {
    let diceName = diceElement.classList[0];
    let maxResult = diceName.substring(1);
    let multiplier = 1;
    if (diceName === "dCustom") {
        maxResult = 100;
        if (Math.random() > 0.5) multiplier = -1;
    }
    let result = multiplier * (1 + Math.floor(Math.random() * maxResult));
    diceElement.innerHTML = result + '';
}

function areAnyDiceRolling() {
    for (const [dice, isDiceRolling] of isRollingMap.entries()) {
        if (isDiceRolling) return true;
    }
    return false;
}

function addToDiceResults(result) {
    pendingDiceResultTotal += result;
    if (areAnyDiceRolling()) {
        showResultLoading();
        return;
    }
    hideResultLoading();
    rollNum++;
    let newResult = document.createElement("span");
    newResult.innerHTML = 'Roll ' + rollNum + ' >> ' + pendingDiceResultTotal + '<br>';
    newResult.classList.add("filter-d6");
    newResult.classList.add("dice-result");
    document.querySelector(".dice-results-container").appendChild(newResult);
    newResult.scrollIntoView(); // auto-scroll results div so new result is shown
    pendingDiceResultTotal = 0;
}

function clearDiceResults() {
    document.querySelector(".dice-results-container").innerHTML = '';
    rollNum = 0;
}



// ------- FORMATTING DICE LAYOUT SCRIPT -------- //

// Dynamically set width depending on viewport width and number of dice on table
function setDiceDimensions() {
    const diceFaces = document.querySelectorAll(".dice-face");
    for (var diceFace of diceFaces) {
        diceFace.style.borderRadius = 0.1 * diceWidth + "px";
        diceFace.style.fontSize = 0.55 * diceWidth + "px";
        diceFace.style.width = diceWidth + "px";
        diceFace.style.height = diceWidth + "px";
        formatTextResult(diceFace);
    }
}

function formatTextResult(diceFace) {
    let resultLen = diceFace.innerHTML.length;
    let resultLeftPadding = 0.325;
    let resultTopPadding = 0.075;
    if (resultLen === 2) {
        resultLeftPadding = 0.2;
    }
    else if (resultLen === 3) {
        resultLeftPadding = 0.1;
    }
    else if (resultLen === 4) {
        resultLeftPadding = 0.0;
    }
    diceFace.style.height = (1-resultTopPadding) * diceWidth + "px";
    diceFace.style.paddingTop = resultTopPadding * diceWidth + "px";
    diceFace.style.width = (1-resultLeftPadding) * diceWidth + "px";
    diceFace.style.paddingLeft = resultLeftPadding * diceWidth + "px";
    //console.log(diceFace.style.paddingLeft)
}

function getNewDiceWidth(diceFaces) {
    const containerWidth = contentContainer.offsetWidth;
    const containerHeight = contentContainer.offsetHeight;
    const minDimension = 0.8 * Math.min(containerWidth, containerHeight);
    let dicePerSide = Math.ceil(Math.sqrt(diceFaces.length));
    return minDimension / dicePerSide;
}

function updateDiceWidth() {
    const diceFaces = document.querySelectorAll(".dice-face");
    diceWidth = getNewDiceWidth(diceFaces);
}



// ---------- TOGGLE DISPLAY ------------ //

function showResultLoading() {
    var loadingElement = document.querySelector(".spinner");
    loadingElement.classList.remove("hidden");
    diceResultsContainer.style.opacity = 0.5;
    positionLoadingHelper(loadingElement);
}

function hideResultLoading() {
    diceResultsContainer.style.opacity = 1.0;
    document.querySelector(".spinner").classList.add("hidden");
}

function positionLoadingHelper(loadingElement) {
    var resultsContainerRect = diceResultsContainer.getBoundingClientRect();
    let midX = (resultsContainerRect.left + resultsContainerRect.right)/2 - loadingElement.clientWidth/2 + 'px';
    let midY = (resultsContainerRect.top + resultsContainerRect.bottom)/2 - loadingElement.clientHeight/2 + 'px';
    loadingElement.style.left = midX;
    loadingElement.style.top = midY;
}

function toggleContentToolbar() {
    let promptElement = document.querySelector('.select-dice-prompt');
    let toolbarElement = document.querySelector('.content-toolbar-container');
    if (getNumDice() === 0 && promptElement.classList.contains('hidden')) {
        promptElement.classList.remove('hidden');
        toolbarElement.classList.add('hidden');
    }
    else if (getNumDice() > 0 && !promptElement.classList.contains('hidden')) {
        promptElement.classList.add('hidden');
        toolbarElement.classList.remove('hidden');
    }
}