'use strict'

const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gLevel;
var gGame;
var gLeftOrRight;
var gTimeInterval;
var gClearInterval;

function init() {
    gLevel = null;
}

function buildBoard() {
    // debugger;
    gBoard = [];
    var size = gLevel.size;
    var mines = gLevel.mines;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
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

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`;
        for (var j = 0; j < gBoard.length; j++) {
            var cellContent = (gBoard[i][j].isMine) ? MINE : gBoard[i][j].minesAroundCount;
            if (!cellContent) cellContent = '';//if there is no neighboors dont write anything insted of zero
            strHTML += `<td class="cell" data-i="${i}" data-j="${j}" data-content="${cellContent}"><button data-i="${i}" data-j="${j}" onmousedown="sideOfMouse(this,event)"></button></td>\n`
        }
        strHTML += `</tr>\n`
    }
    var elFlagSpan = document.querySelector('.mines-counter');
    elFlagSpan.innerText = gLevel.mines;
    var elTbody = document.querySelector('.cells');
    elTbody.innerHTML = strHTML;
}

function cellClicked(elBtn) {
    // debugger;
    var elTd = elBtn.parentElement;
    var cellContent = elTd.getAttribute('data-content');
    var cellI = elTd.getAttribute('data-i');
    var cellJ = elTd.getAttribute('data-j');
    if (!gGame.isOn) {//first click
        if (gLeftOrRight) {
            expandShown(cellI, cellJ);
            gTimeInterval = setInterval(function () {
                var elTimerSpan = document.querySelector('.timer');
                elTimerSpan.innerText++;
            }, 1000);
            gGame.isOn = true;
            //update the model
            gBoard[cellI][cellJ].isShown = true;
            //update the DOM
            elTd.innerText = cellContent;
        }
        else return;//if first click is flag(right click) dont do anything
    }
    if (cellContent === MINE && gLeftOrRight) {
        elTd.innerText = cellContent;
        elTd.classList.add('mine');
        gameOver(false);
        return;
    }
    else if (!gLeftOrRight) {
        if (gBoard[cellI][cellJ].isMarked) {
            //update the model
            gBoard[cellI][cellJ].isMarked = false;
            //update the DOM
            var elFlagSpan = document.querySelector('.mines-counter');
            elFlagSpan.innerText++;
            elBtn.innerText = '';
        }
        else {
            //update the model
            gBoard[cellI][cellJ].isMarked = true;
            //update the DOM
            var elFlagSpan = document.querySelector('.mines-counter');
            elFlagSpan.innerText--;
            elBtn.innerText = FLAG;
        }
    }
    else {
        if(!cellContent) expandShown(cellI, cellJ);
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
        elEmoji.innerText = '😎🥳';
    }
    else {
        elEmoji.innerText = '🤯';
        getUnrevealCells();
        // gClearInterval=setInterval(getUnrevealCells, 1000);
    }
    return;
}

function restart() {
    var elEmoji = document.querySelector('.emoji');
    elEmoji.innerText = '😃';
    var elTimerSpan = document.querySelector('.timer');
    elTimerSpan.innerText = 0;
    buildBoard();
}

function isVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
            var currContent = currCell.getAttribute('data-content');
            if (!gBoard[i][j].isShown && currContent === MINE) {
                if (!gBoard[i][j].isMarked) return false;
            }
            if (!gBoard[i][j].isShown && currContent !== MINE) {
                return false;
            }
        }

    }
    return true;
}

function getUnrevealCells() {
    // debugger;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isShown) {
                // setTimeout(function(){
                //update the model
                gBoard[i][j].isShown = true;
                //update the DOM
                var currCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                var currContent = currCell.getAttribute('data-content');
                if (currContent === MINE) currCell.classList.add('mine');
                currCell.innerText = currContent;
                // },500);
            }
        }
    }
}

function expandShown(i, j) {
    gBoard[i][j].isShown = true;
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    var currContent = elCell.getAttribute('data-content');
    if (currContent !== MINE) elCell.innerText = currContent;
    for (var k = i - 1; k <= parseInt(i) + 1; k++) {
        for (var d = j - 1; d <= parseInt(j) + 1; d++) {
            if (k < 0 || d < 0 || k > gBoard.length - 1 || d > gBoard.length - 1) continue;
            if (k === i && d === j) continue;
            var currCell = gBoard[k][d];
            if (currCell.isShown) continue;
            var negsCount = currCell.minesAroundCount;
            currCell.isShown = true;
            elCell = document.querySelector(`[data-i="${k}"][data-j="${d}"]`);
            currContent = elCell.getAttribute('data-content');
            if (currContent !== MINE) elCell.innerText = currContent
            if (negsCount === 0) {
                expandShown(k, d);
            }
        }
    }
}

