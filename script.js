const gameBoard = (() => {
  let board;

  const resetBoard = () => {
    board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  };

  const playerMove = (symbol, [coordY, coordX]) => {
    board[coordY][coordX] = symbol;
  };

  const getBoard = () => board;

  const getField = ([row, col]) => board[row][col];

  return { playerMove, resetBoard, getBoard, getField };
})();

const createPlayer = (symbol, name) => {
  return { name, symbol };
};

const gameController = (() => {
  let gameInProgress = false;
  let turn = null;
  let players = [];

  const checkRow = (board, rowNum) => {
    const firstSymbol = board[rowNum][0];

    if (!firstSymbol) return false;

    for (let col in board[rowNum]) {
      if (board[rowNum][col] !== firstSymbol) {
        return false;
      }
    }
    return firstSymbol;
  };

  const checkColumn = (board, colNum) => {
    const firstSymbol = board[0][colNum];

    if (!firstSymbol) return false;

    for (let row in board) {
      if (board[row][colNum] !== firstSymbol) {
        return false;
      }
    }
    return firstSymbol;
  };

  const checkDiagonalFwd = (board) => {
    const firstSymbol = board[0][0];

    if (!firstSymbol) return false;

    for (let cell = 0; cell < board.length; cell++) {
      if (board[cell][cell] !== firstSymbol) return false;
    }
    return firstSymbol;
  };
  const checkDiagonalBack = (board) => {
    const firstSymbol = board[board.length - 1][0];
    if (!firstSymbol) return false;

    for (let cell = board.length - 1; cell >= 0; cell--) {
      if (board[cell][board.length - 1 - cell] !== firstSymbol) return false;
    }
    return firstSymbol;
  };

  const checkforWin = () => {
    const currentBoard = gameBoard.getBoard();
    let winner;
    // check horizontal (rows)
    for (let row in currentBoard) {
      winner = checkRow(currentBoard, row);
      if (winner) return winner;
    }
    // check vertical (columns)
    for (let col in currentBoard[0]) {
      winner = checkColumn(currentBoard, col);
      if (winner) return winner;
    }
    // check diagonal (forwards)
    winner = checkDiagonalFwd(currentBoard);
    if (winner) return winner;
    // check diagonal (backwards)
    winner = checkDiagonalBack(currentBoard);
    if (winner) return winner;
  };

  function startGame() {
    gameBoard.resetBoard();
    const player1NameInput = uiController.getInputFieldValue("#p1-name");
    const player2NameInput = uiController.getInputFieldValue("#p2-name");
    players = [
      createPlayer("O", player1NameInput),
      createPlayer("X", player2NameInput),
    ];
    gameInProgress = true;
    turn = 0;

    uiController.displayBoard(turn, players[Math.floor(turn % 2)].name);
    uiController.setResetBtn("Reset", false);
  }

  const placeMarker = ([y, x]) => {
    if (gameBoard.getField([y, x]) === null && gameInProgress) {
      gameBoard.playerMove(players[Math.floor(turn % 2)].symbol, [y, x]);
      turn++;
      uiController.displayBoard(turn, players[Math.floor(turn % 2)].name);
      if (checkforWin()) {
        gameInProgress = false;
        uiController.declareWinner(
          players[Math.floor((turn - 1) % 2)].name,
          turn
        );
      }
    }
  };

  const displayStartScreen = () => {
    uiController.displayStartScreen();
    document.querySelector("#turn-info").textContent = "Start new game";
    uiController.setResetBtn(" ", true);
    document.querySelector("#reset-btn").addEventListener("click", () => {
      gameController.displayStartScreen();
    });
  };

  return { displayStartScreen, startGame, placeMarker };
})();

const makeButton = (content, [row, col]) => {
  const btn = `<button id="btn-${row}-${col}" class="board-btn">${
    content ? content : " "
  }</button>`;
  return btn;
};

const uiController = (() => {
  const gameContainer = document.querySelector("#game-container");

  const getInputFieldValue = (id) => document.querySelector(id).value;

  const displayStartScreen = () => {
    gameContainer.innerHTML = `
      <div id="start-screen">
        <label for="p1-name">Player 1 Name:
          <input id="p1-name" type="text" max="12" value="Player 1">
        </label>
        <label for="p2-name">Player 2 Name:
          <input id="p2-name" type="text" max="12" value="Player 2">
        </label>
        <button id="start-btn">Start Game</button>
        </div>`;
    document
      .querySelector("#start-btn")
      .addEventListener("click", () => gameController.startGame());
  };

  const declareWinner = (playerName, turn) => {
    document.querySelector("#turn-info").textContent = `Turn ${
      turn + 1
    }: ${playerName} Wins!`;
    uiController.setResetBtn("Play Again?", false);
  };

  const displayBoard = (turn, playerName) => {
    const currentBoard = gameBoard.getBoard().map((x) => x);

    gameContainer.innerHTML = " ";
    for (let row in currentBoard) {
      for (let col in currentBoard[row]) {
        gameContainer.innerHTML += makeButton(currentBoard[row][col], [
          row,
          col,
        ]);
      }
    }

    const buttons = document.querySelectorAll(".board-btn");
    for (let button of buttons) {
      const [row, col] = button.id.replace("btn-", "").split("-");
      button.addEventListener("click", () =>
        gameController.placeMarker([row, col])
      );
    }

    document.querySelector("#turn-info").textContent = `Turn ${
      turn + 1
    }: ${playerName}`;
  };

  const setResetBtn = (text, disabled) => {
    const resetBtn = document.querySelector("#reset-btn");
    resetBtn.textContent = text;
    resetBtn.disabled = disabled;
  }
  return {
    displayStartScreen,
    displayBoard,
    declareWinner,
    getInputFieldValue,
    setResetBtn
  };
})();

gameController.displayStartScreen();
