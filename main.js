(() => {
  const game = {
    init() {
      this.cacheDom();
      this.bindEvents();
      this.initBoard();
      this.turn = 1;
      this.humanWins = 0;
      this.aiWins = 0;
      this.displayScore();
    },
    cacheDom() {
      this.boxes = document.getElementsByClassName('box');
      this.startModal = document.getElementById('introModal');
      this.endModal = document.getElementById('resultModal');
      this.resultTitle = document.getElementsByTagName('h2')[0];
      this.close = document.getElementById('restart');
      this.buttons = document.getElementsByClassName('btn');
      this.humanScore = document.getElementById('human-score');
      this.aiScore = document.getElementById('machine-score');
    },
    bindEvents() {
      Array.from(this.buttons).forEach((button) => {
        button.addEventListener('click', this.chooseSign.bind(this));
        button.addEventListener('click', this.closeStartModal.bind(this));
      });

      Array.from(this.boxes).forEach((box) => {
        box.addEventListener('click', this.fillBox.bind(this));
      });

      this.close.addEventListener('click', this.closeEndModal.bind(this));
    },
    initBoard() {
      this.board = [];

      Array.from(this.boxes).forEach((box) => {
        this.board.push(box.textContent);
      });
      // Empty array when restart
      this.board.fill('');
    },
    displayScore() {
      this.humanScore.textContent = this.humanWins;
      this.aiScore.textContent = this.aiWins;
    },
    chooseSign({ target }) {
      this.human = target.textContent;

      if (this.human === 'X') {
        this.ai = target.nextElementSibling.textContent;
      } else {
        this.ai = target.previousElementSibling.textContent;
      }
    },
    render(box, player) {
      box.textContent = player;
    },
    moves(index, player) {
      this.board.splice(index, 1, player);
    },
    fillBox({ target: box }) {
      const index = Array.prototype.indexOf.call(this.boxes, box);

      if (!box.textContent) {
        this.render(box, this.human);
        this.moves(index, box.textContent);

        if (this.isMovesLeft(this.board)) {
          this.compute();
        }
        this.endGame(this.evaluate(this.board));
      }
    },
    aiStarts() { // Get random pos for first move
      const _this = this;
      const randomBox = this.getRandomInt(9);

      setTimeout(() => {
        _this.render(_this.boxes[randomBox], _this.ai);
      }, 500);

      this.moves(randomBox, this.ai);
    },
    compute() {
      const bestMove = this.findBestMove();
      const _this = this;

      setTimeout(() => {
        _this.render(_this.boxes[bestMove], _this.ai);
      }, 500);

      this.board.splice(bestMove, 1, this.ai);
    },
    getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    },
    evaluate(board) {
      let value = 0; // If none of the players won

      for (let i = 0; i < board.length; i += 3) { // Rows
        if (board[i] === board[i + 1] && board[i + 1] === board[i + 2]) {
          if (board[i] === this.ai) {
            value = 10;
          } else if (board[i] === this.human) {
            value = -10;
          }
        }
      }

      for (let i = 0; i < board.length; i++) { // Columns
        if (board[i] === board[i + 3] && board[i + 3] === board[i + 6]) {
          if (board[i] === this.ai) {
            value = 10;
          } else if (board[i] === this.human) {
            value = -10;
          }
        }
      }

      if ((board[0] === board[4] && board[4] === board[8]) ||
          (board[2] === board[4] && board[4] === board[6])) { // Diagonals
        if (board[4] === this.ai) {
          value = 10;
        } else if (board[4] === this.human) {
          value = -10;
        }
      }

      return value;
    },
    isMovesLeft(board) {
      return board.some(index => index === '');
    },
    minimax(board, depth, isMax) {
      const score = this.evaluate(board);

      if (score === 10) { // If human or ai wins, return his/her score (+-depth to find fastest win)
        return score - depth;
      }
      if (score === -10) {
        return score + depth;
      }

      if (!this.isMovesLeft(board)) { // Tie if no more moves or no winner
        return 0;
      }

      if (isMax) { // If ai's move
        let best = -1000;

        for (let i = 0; i < board.length; i++) {
          if (board[i] === '') {
            board[i] = this.ai;
            best = Math.max(best, this.minimax(board, depth + 1, !isMax));
            board[i] = '';
          }
        }
        return best;
      }
      // If human's move
      let best = 1000;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = this.human;
          best = Math.min(best, this.minimax(board, depth + 1, !isMax));
          board[i] = '';
        }
      }
      return best;
    },
    findBestMove() {
      const board = this.board.slice(); // No modification of the original array
      let bestVal = -1000;
      let bestMove;

      for (let i = 0; i < board.length; i++) {

        if (board[i] === '') {
          board[i] = this.ai;
          const moveVal = this.minimax(board, 0, false);
          board[i] = '';

          if (moveVal > bestVal) {
            bestMove = i;
            bestVal = moveVal;
          }
        }
      }

      return bestMove;
    },
    endGame(result) {
      if (result === -10 || result === 10
        || (result === 0 && !this.isMovesLeft(this.board))) {
        if (this.turn % 2 === 0 || result === 10) { // Takes more time to let ai's move display
          const _this = this;

          setTimeout(() => {
            _this.openEndModal(result);
          }, 800);
        } else {
          this.openEndModal(result);
        }

        this.turn++;
        this.initBoard();
      }
    },
    closeStartModal() {
      this.startModal.style.display = 'none';
    },
    openEndModal(value) {
      switch (value) {
        case 0:
          this.resultTitle.textContent = 'It was a tie!';
          this.humanWins++;
          this.aiWins++;
          break;
        case 10:
          this.resultTitle.textContent = 'You lost!';
          this.aiWins++;
          break;
        case -10:
          this.resultTitle.textContent = 'You win!';
          this.humanWins++;
          break;
        default:
          break;
      }
      this.displayScore();
      this.endModal.style.display = 'block';
    },
    closeEndModal() {
      Array.from(this.boxes).forEach(box => box.textContent = '');
      this.endModal.style.display = 'none';

      if (this.turn % 2 === 0) { // Let ai start
        this.aiStarts();
      }
    },
  };

  game.init();
})();
