'use strict'

function randomEmptyCell() {
    var res = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine) res.push({ i: i, j: j });
        }
    }
    var randomIdx = getRandomIntInclusive(0, res.length - 1);
    return res[randomIdx];
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function howManyNegsMines(i, j) {
    var countNegs = 0;
    for (var k = i - 1; k <= i + 1; k++) {
        for (var d = j - 1; d <= j + 1; d++) {
            if (k < 0 || d < 0 || k > gBoard.length - 1 || d > gBoard.length - 1) continue;
            if (k === i && d === j) continue;
            if (gBoard[k][d].isMine) countNegs++;
        }
    }
    return countNegs;
}

function getSize(elBtn) {
    clearInterval(gTimeInterval);
    gTimeInterval = null;
    var elTimerSpan = document.querySelector('.timer');
    elTimerSpan.innerText=0;
    var elSpan = document.querySelector('.lives');
    elSpan.innerText = '❤️❤️❤️';
    if (elBtn.classList.contains('easy')) {
        gLevel = {
            size: 4,
            mines: 2
        };
        buildBoard();
    }
    if (elBtn.classList.contains('medium')) {
        gLevel = {
            size: 8,
            mines: 12
        };
        buildBoard();
    }
    if (elBtn.classList.contains('hard')) {
        gLevel = {
            size: 12,
            mines: 30
        };
        buildBoard();
    }
}
