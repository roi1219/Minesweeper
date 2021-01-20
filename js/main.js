'use strict'

const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gLevel;
var gGame;
var gLeftOrRight;
var gTimeInterval;

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
            if (!cellContent) cellContent = '';
            strHTML += `<td class="cell" data-i="${i}" data-j="${j}" data-content="${cellContent}"><button onmousedown="sideOfMouse(this,event)"></button></td>\n`
        }
        strHTML += `</tr>\n`
    }
    var elFlagSpan = document.querySelector('.mines-counter');
    elFlagSpan.innerText = gLevel.mines;
    var elTbody = document.querySelector('.cells');
    elTbody.innerHTML = strHTML;
}

function cellClicked(elBtn) {
    var elTd = elBtn.parentElement;
    var cellContent = elTd.getAttribute('data-content');
    var cellI = elTd.getAttribute('data-i');
    var cellJ = elTd.getAttribute('data-j');
    if (!gGame.isOn) {
        if (gLeftOrRight) {
            gTimeInterval = setInterval(function () {
                var elTimerSpan = document.querySelector('.timer');
                elTimerSpan.innerText++;
            }, 1000);
            gGame.isOn = true;
            //update the model
            gBoard[cellI][cellJ].isShown = true;
            //update the DOM
            elBtn.classList.add('hidden');
            elTd.innerText = cellContent;
        }
        else return;
    }
    if (cellContent === MINE && gLeftOrRight) {
        elBtn.classList.add('hidden');
        elTd.innerText = cellContent;
        clearInterval(gTimeInterval);
        gTimeInterval = null;
        var elEmoji = document.querySelector('.emoji');
        elEmoji.innerText = '🤯';
        gameOver(elTd);
        return;
    }
    else if (!gLeftOrRight) {
        //update the model
        gBoard[cellI][cellJ].isMarked = true;
        //update the DOM
        var elFlagSpan = document.querySelector('.mines-counter');
        elFlagSpan.innerText--;
        elBtn.innerText = FLAG;
    }
    else {
        //update the model
        gBoard[cellI][cellJ].isShown = true;
        //update the DOM
        elBtn.classList.add('hidden');
        elTd.innerText = cellContent;
    }

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
function gameOver(elTd) {
    gGame.isOn = false;
    elTd.classList.add('mine');
    var elModal = document.querySelector('.modal');
    var elP=elModal.querySelector('p');
    elP.innerText='!*YoU ExPLoDeD*!'
    elModal.style.display='block';
    // var elRstBtn = document.querySelector('.modal');
    // elRstBtn.classList.remove('hidden');
    return;
}

function restart() {
    var elEmoji = document.querySelector('.emoji');
    elEmoji.innerText = '😃';
    var elModal = document.querySelector('.modal');
    elModal.style.display='none';
    // var elRstBtn = document.querySelector('.modal');
    // elRstBtn.classList.add('hidden');
    var elTimerSpan = document.querySelector('.timer');
    elTimerSpan.innerText = 0;
    buildBoard();
}

function isVictory() {
    var winEmoji='😎🥳';
}
