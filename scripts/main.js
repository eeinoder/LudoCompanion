// ----------- GLOBALS ------------//
const contentContainer = document.querySelector(".content-container");
const diceFacesContainer = document.querySelector(".dice-faces-container");
const colorMap = {"d4":"rgb(216,176,0)", "d6":"hsl(120,100.0%,47.1%)"
                , "d8":"rgb(0,240,182)", "d10":"rgb(0,197,255)"
                , "d12":"rgb(182,136,255)", "d20":"rgb(255,93,255)"
                , "dCustom":"rgb(255,92,150)"}
let isRollingMap = new Map();
let diceWidth;



// ----------- RENDER COMPONENTS ------ //

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
    updateDiceWidth();
    rollDice(newDice);
    setDiceDimensions();
}

function diceFaceClickHandler(event) {
    removeDiceFromContainer(event.target);
    refreshDiceDimensions();
}

function undoButtonClickHandler() {
    removeLastDice();
    refreshDiceDimensions();
}


// ----------- HELPERS ---------------- //
function refreshDiceDimensions() {
    updateDiceWidth();
    setDiceDimensions();
}



// ----------- DICE SCRIPT ------------ //

// NOTE: implementing SUPER simplified version (no real animation or 3D)
// "Dice roll" animation is rounded square div with quickly changing face value...

function addDiceToContainer(diceName) {
    let newDice = document.createElement("div");
    newDice.addEventListener("click", diceFaceClickHandler);
    newDice.classList.add(diceName);
    newDice.classList.add('dice-face');
    newDice.classList.add('didact-font');
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
