'use strict'

const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gLevel;
var gGame;
var gLeftOrRight;
var gTimeInterval;
var gClearInterval;
var gHint;
var gIsPlaceMine;
var gSafeClick;
var gMoves;

function init() {
    gLevel = null;
}

function buildBoard() {
    gMoves = [];
    gBoard = [];
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    };
    gHint = {
        isOn: false,
        hintsCount: 3
    };
    gSafeClick = 3;
    var size = gLevel.size;
    var mines = gLevel.mines;
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    gBoard = board;
    while (mines > 0) {
        var emptyCell = randomEmptyCell();
        gBoard[emptyCell.i][emptyCell.j].isMine = true;
        mines--;
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = howManyNegsMines(i, j);
        }
    }
    renderBoard();
}

function buildBoardManually() {
    gBoard = [];
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    };
    gHint = {
        isOn: false,
        hintsCount: 3
    };
    var size = gLevel.size;
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    gBoard = board;
    renderBoard();
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`;
        for (var j = 0; j < gBoard.length; j++) {
            var cellContent = (gBoard[i][j].isMine) ? MINE : gBoard[i][j].minesAroundCount;
            var textColorClass;
            if(cellContent>=3) textColorClass='red';
            else if(cellContent===2) textColorClass='green';
            else if(cellContent===1) textColorClass='blue';
            else textColorClass='';
            if (!cellContent) cellContent = '';//if there is no neighboors dont write anything insted of zero
            strHTML += `<td class="cell ${textColorClass}" data-i="${i}" data-j="${j}" data-content="${cellContent}"><button data-i="${i}" data-j="${j}" onmousedown="sideOfMouse(this,event)"></button></td>\n`
        }
        strHTML += `</tr>\n`
    }
    var elTbody = document.querySelector('.cells');
    elTbody.innerHTML = strHTML;
}

function placeMines() {
    var elFlagSpan = document.querySelector('.mines-counter');
    elFlagSpan.innerText = '0';
    buildBoardManually();
    gIsPlaceMine = true;
}
function confirm() {
    gIsPlaceMine = false;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = howManyNegsMines(i, j);
        }
    }
    renderBoard();
}

function cellClicked(elBtn) {
    var elTd = elBtn.parentElement;
    var cellContent = elTd.getAttribute('data-content');
    var cellI = elTd.getAttribute('data-i');
    var cellJ = elTd.getAttribute('data-j');
    if (gIsPlaceMine) {
        elBtn.innerText = MINE;
        gBoard[cellI][cellJ].isMine = true;
        var elFlagSpan = document.querySelector('.mines-counter');
        elFlagSpan.innerText++;;
        return;
    }
    if (!gGame.isOn) {//first click
        if (gLeftOrRight) {//left click
            if (cellContent === MINE) {
                gBoard[cellI][cellJ].isMine = false;
                var emptyCell = randomEmptyCell();
                gBoard[emptyCell.i][emptyCell.j].isMine = true;
                for (var i = 0; i < gBoard.length; i++) {
                    for (var j = 0; j < gBoard.length; j++) {
                        gBoard[i][j].minesAroundCount = howManyNegsMines(i, j);
                    }
                }
                renderBoard();
                //update the model
                gBoard[cellI][cellJ].isShown = true;
                //update the DOM
                elTd.innerText = cellContent;
            }
            gTimeInterval = setInterval(function () {
                var elTimerSpan = document.querySelector('.timer');
                elTimerSpan.innerText++;
            }, 1000);
            gGame.isOn = true;
            //update the model
            gBoard[cellI][cellJ].isShown = true;
            //update the DOM
            elTd.innerText = cellContent;
            expandShown(cellI, cellJ);
            gMoves[gMoves.length - 1].isExpandMove = false;
            return;
        }
        else return;//if first click is flag(right click) dont do anything
    }
    if (gHint.isOn && gHint.hintsCount > 0) {
        var elSpan = document.querySelector('.active-hint');
        elSpan.innerText = '';
        gHint.isOn = false;
        gHint.hintsCount--;
        var elSpan = document.querySelector('.hints');
        elSpan.innerText = (gHint.hintsCount === 2) ? '💡💡' : ((gHint.hintsCount === 1) ? '💡' : 'NO MORE HINTS');
        for (var i = cellI - 1; i <= parseInt(cellI) + 1; i++) {
            for (var j = cellJ - 1; j <= parseInt(cellJ) + 1; j++) {
                if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
                var currBtn = document.querySelector(`button[data-i="${i}"][data-j="${j}"]`);
                if (!currBtn) continue;
                var currCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                var currContent = currCell.getAttribute('data-content');
                currBtn.innerText = currContent
            }
        }
        setTimeout(function () {
            for (var i = cellI - 1; i <= cellI + 1; i++) {
                for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                    if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1) continue;
                    var currBtn = document.querySelector(`button[data-i="${i}"][data-j="${j}"]`);
                    if (!currBtn) continue;
                    currBtn.innerText = '';
                }
            }
        }, 1000);
        return;
    }
    if (gBoard[cellI][cellJ].isMarked && gLeftOrRight) return;//left click on marked does nothing
    if (cellContent === MINE && gLeftOrRight) {//check if game over with lives count 
        if (gGame.lives > 1) {
            gGame.lives--;
            elBtn.innerText = cellContent;
            var elSpan = document.querySelector('.lives');
            elSpan.innerText = (gGame.lives === 2) ? '❤️❤️' : '❤️';
            setTimeout(function () {
                elBtn.innerText = '';
            }, 1000)
        }
        else {
            var elSpan = document.querySelector('.lives');
            elSpan.innerText = 'NO MORE LIFES';
            elTd.innerText = cellContent;
            elTd.classList.add('mine');
            gameOver(false);
            return;
        }
    }
    else if (!gLeftOrRight) {//flags
        if (gBoard[cellI][cellJ].isMarked) {
            //update the model
            gBoard[cellI][cellJ].isMarked = false;
            gMoves.push({ i: parseInt(cellI), j: parseInt(cellJ), isExpandMove: false, content: `<button data-i="${cellI}" data-j="${cellJ}" onmousedown="sideOfMouse(this,event)"></button>` });
            //update the DOM
            var elFlagSpan = document.querySelector('.mines-counter');
            elFlagSpan.innerText++;
            elBtn.innerText = '';
        }
        else {
            //update the model
            gBoard[cellI][cellJ].isMarked = true;
            gMoves.push({ i: parseInt(cellI), j: parseInt(cellJ), isExpandMove: false, content: `<button data-i="${cellI}" data-j="${cellJ}" onmousedown="sideOfMouse(this,event)"></button>` });
            //update the DOM
            var elFlagSpan = document.querySelector('.mines-counter');
            elFlagSpan.innerText--;
            elBtn.innerText = FLAG;
        }
    }
    else {
        if (!cellContent) {
            expandShown(cellI, cellJ);
            gMoves[gMoves.length - 1].isExpandMove = false;
        }
        else gMoves.push({ i: cellI, j: cellJ, isExpandMove: false, content: `<button data-i="${cellI}" data-j="${cellJ}" onmousedown="sideOfMouse(this,event)"></button>` });
        //update the model
        gBoard[cellI][cellJ].isShown = true;
        //update the DOM
        elTd.innerText = cellContent;
    }
    if (isVictory()) gameOver(true);

}

function sideOfMouse(elBtn, ev) {
    // debugger;
    //remove defualt menu of right click
    elBtn.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
    //understand whice mouse click was clicked
    switch (ev.which) {
        case 1:
            gLeftOrRight = true;
            cellClicked(elBtn);
            break;
        case 2:
            break;
        case 3:
            gLeftOrRight = false;
            cellClicked(elBtn);
            break;
    }
}

function gameOver(isWin) {
    gGame.isOn = false;
    clearInterval(gTimeInterval);
    gTimeInterval = null;
    var elEmoji = document.querySelector('.emoji');
    if (isWin) {
        var audioElement = new Audio('../audio/winner.mp3');
        audioElement.play();
        elEmoji.innerText = '😎🥳';
    }
    else {
        var audioElement = new Audio('../audio/bomb.mp3');
        audioElement.play();
        elEmoji.innerText = '🤯';
        getUnrevealCells();
    }
}

function restart() {
    clearInterval(gTimeInterval);
    gTimeInterval = null;
    var elEmoji = document.querySelector('.emoji');
    elEmoji.innerText = '😃';
    var elSpanLives = document.querySelector('.lives');
    elSpanLives.innerText = '❤️❤️❤️';
    var elSpanHintV = document.querySelector('.active-hint');
    elSpanHintV.innerText = '';
    var elSpanHint = document.querySelector('.hints');
    elSpanHint.innerText = '💡💡💡';
    var elSpanHint = document.querySelector('.safe-clicks');
    elSpanHint.innerText = '👼👼👼';
    var elTimerSpan = document.querySelector('.timer');
    elTimerSpan.innerText = 0;
    var elFlagSpan = document.querySelector('.mines-counter');
    elFlagSpan.innerText = gLevel.mines;
    buildBoard();
}

function isVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            var currContent = currCell.getAttribute('data-content');
            if (!gBoard[i][j].isShown && currContent === MINE) {//not shown, is a mine but unflaged
                if (!gBoard[i][j].isMarked) return false;
            }
            if (!gBoard[i][j].isShown && currContent !== MINE) {//not shown and not a mine
                return false;
            }
        }

    }
    return true;
}

function getUnrevealCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isShown) {
                //update the model
                gBoard[i][j].isShown = true;
                //update the DOM
                var currCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                var currContent = currCell.getAttribute('data-content');
                if (currContent === MINE) currCell.classList.add('mine');
                currCell.innerText = currContent;
            }
        }
    }
}

function hint() {
    var elSpan = document.querySelector('.active-hint');
    if (gHint.isOn) {
        gHint.isOn = false;
        elSpan.innerText = ''
    }
    else {
        gHint.isOn = true;
        elSpan.innerText = '✔️'
    }
}

function expandShown(i, j) {
    // debugger
    //update the model
    gBoard[i][j].isShown = true;
    //update the DOM
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    var currContent = elCell.getAttribute('data-content');
    if (currContent !== MINE) {
        elCell.innerText = currContent;
        gMoves.push({ i: parseInt(i), j: parseInt(j), isExpandMove: true, content: `<button data-i="${i}" data-j="${j}" onmousedown="sideOfMouse(this,event)"></button>` });
    }
    for (var k = i - 1; k <= parseInt(i) + 1; k++) {
        for (var d = j - 1; d <= parseInt(j) + 1; d++) {
            if (k < 0 || d < 0 || k > gBoard.length - 1 || d > gBoard.length - 1) continue;
            if (k === i && d === j) continue;
            var currCell = gBoard[k][d];
            if (currCell.isShown) continue;
            var negsCount = currCell.minesAroundCount;
            //update the model
            currCell.isShown = true;
            //update the DOM
            elCell = document.querySelector(`[data-i="${k}"][data-j="${d}"]`);
            currContent = elCell.getAttribute('data-content');
            if (currContent !== MINE) {
                elCell.innerText = currContent
            }
            if (negsCount === 0) {
                expandShown(k, d);
            }
            else {
                gMoves.push({ i: k, j: d, isExpandMove: true, content: `<button data-i="${k}" data-j="${d}" onmousedown="sideOfMouse(this,event)"></button>` });

            }
        }
    }
}

function safeClick() {
    if (!gSafeClick) return;
    gSafeClick--;
    var elSafeClick = document.querySelector('.safe-clicks');
    elSafeClick.innerText = (gSafeClick === 2) ? '👼👼' : ((gSafeClick === 1) ? '👼' : 'NO MORE SAFE CLICKS');
    var res = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) res.push({ i: i, j: j });
        }
    }
    var randomIdx = getRandomIntInclusive(0, res.length - 1);
    var emptyCell = res[randomIdx];
    var elCell = document.querySelector(`[data-i="${emptyCell.i}"][data-j="${emptyCell.j}"]`);
    elCell.classList.add('safe-click');
    setTimeout(function () {
        elCell.classList.remove('safe-click');
    }, 1000);
}


function undo() {
    if (!gMoves) return;
    var lastMove = gMoves.pop();
    var lastI = lastMove.i;
    var lastj = lastMove.j;
    var lastContent = lastMove.content;
    var lastCell = document.querySelector(`[data-i="${lastI}"][data-j="${lastj}"]`);
    gBoard[lastI][lastj].isShown = false;
    lastCell.innerHTML = lastContent;
    while (gMoves.length > 0 && gMoves[gMoves.length - 1].isExpandMove) {
        lastMove = gMoves.pop();
        lastI = lastMove.i;
        lastj = lastMove.j;
        lastContent = lastMove.content;
        lastCell = document.querySelector(`[data-i="${lastI}"][data-j="${lastj}"]`);
        gBoard[lastI][lastj].isShown = false;
        lastCell.innerHTML = lastContent;
    }
}