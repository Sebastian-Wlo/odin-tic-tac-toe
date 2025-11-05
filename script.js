const gameBoard = (() => {
  let board;

  const resetBoard = () => {
    board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  };

  const playerMove = (symbol, [coordY, coordX]) => {
    board[coordY][coordX] = symbol;
  };

  const arrAsString = (arr) => arr.reduce((acc, currVal) => acc + currVal, "");

  const getBoard = () => board;
  const getField = ([row, col]) => board[row][col];
  const getRowStr = (row) => arrAsString(board[row]);
  const getColStr = (col) => arrAsString(board.map((row) => row[col]));
  const getDiagFwdStr = () => {
    let diagArr = [];
    for (let n = 0; n < board.length; n++) {
      diagArr.push(board[n][n]);
    }
    return arrAsString(diagArr);
  };
  const getDiagBckStr = () => {
    let diagArr = [];
    for (let n = board.length - 1; n >= 0; n--) {
      diagArr.push(board[n][board.length - 1 - n]);
    }
    return arrAsString(diagArr);
  };

  return {
    playerMove,
    resetBoard,
    getBoard,
    getField,
    getRowStr,
    getColStr,
    getDiagFwdStr,
    getDiagBckStr,
  };
})();

const createPlayer = (symbol, name) => {
  return { name, symbol };
};

const gameController = (() => {
  const symbolRegex = /^(O{1,3}|X{1,3})$/;
  let gameInProgress = false;
  let turn = null;
  let players = [];

  const checkRow = (board, rowNum) => {
    const rowString = gameBoard.getRowStr(rowNum);
    if (symbolRegex.test(rowString)) {
      return rowString.length === 3 ? rowString[0] : true;
    }
    return false;
  };

  const checkCol = (board, colNum) => {
    const colString = gameBoard.getColStr(colNum);
    if (symbolRegex.test(colString)) {
      return colString.length === 3 ? colString[0] : true;
    }
    return false;
  };

  const checkDiagonalFwd = (board) => {
    const diagFStr = gameBoard.getDiagFwdStr();
    if (symbolRegex.test(diagFStr)) {
      return diagFStr.length === 3 ? diagFStr[0] : true;
    }
    return false;
  };

  const checkDiagonalBack = (board) => {
    const diagBStr = gameBoard.getDiagBckStr();
    if (symbolRegex.test(diagBStr)) {
      return diagBStr.length === 3 ? diagBStr[0] : true;
    }
    return false;
  };

  const checkforWin = () => {
    const currentBoard = gameBoard.getBoard();
    let possibleWins = 0;
    // check horizontal (rows)
    for (let row in currentBoard) {
      const outcome = checkRow(currentBoard, row);
      //console.log("checking row outcome", outcome, typeof outcome);
      if (outcome) {
        if (outcome === "O" || outcome === "X") return outcome;
        else possibleWins++;
      }
    }
    // check vertical (columns)
    for (let col in currentBoard[0]) {
      const outcome = checkCol(currentBoard, col);
      if (outcome) {
        if (outcome === "O" || outcome === "X") return outcome;
        else possibleWins++;
      }
    }
    // check diagonal (forwards)
    const outcomeF = checkDiagonalFwd();
    if (outcomeF) {
      if (outcomeF === "O" || outcomeF === "X") return outcomeF;
      else possibleWins++;
    }
    // check diagonal (backwards)
    const outcomeB = checkDiagonalBack();
    if (outcomeB) {
      if (outcomeB === "O" || outcomeB === "X") return outcomeB;
      else possibleWins++;
    }

    //console.log("possibleWins:", possibleWins);
    if (possibleWins === 0) return false;
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
    if (gameBoard.getField([y, x]) === "" && gameInProgress) {
      gameBoard.playerMove(players[Math.floor(turn % 2)].symbol, [y, x]);
      turn++;
      uiController.displayBoard(turn, players[Math.floor(turn % 2)].name);
      //console.log("checkForWin:", checkforWin());
      const winner = checkforWin();
      if (winner) {
        gameInProgress = false;
        uiController.declareWinner(
          players[Math.floor((turn - 1) % 2)].name,
          turn
        );
      } else if (winner === false) {
        gameInProgress = false;
        uiController.declareDraw();
      }
    }
  };

  const displayStartScreen = () => {
    uiController.displayStartScreen();
    document.querySelector("#turn-info").textContent = "Start a new game";
    uiController.setResetBtn(" ", true);
    document.querySelector("#reset-btn").addEventListener("click", () => {
      gameController.displayStartScreen();
    });
  };

  return { displayStartScreen, startGame, placeMarker };
})();

const makeButton = (content, [row, col]) => {
  const btn = `<button id="btn-${row}-${col}" class="board-btn">${
    content ? content : ""
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

  const declareDraw = () => {
    document.querySelector("#turn-info").textContent = "Draw!";
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
  };
  return {
    displayStartScreen,
    displayBoard,
    declareWinner,
    declareDraw,
    getInputFieldValue,
    setResetBtn,
  };
})();

gameController.displayStartScreen();
