import { cloneDeep } from 'lodash';
import { BOARD_SIZE, CELLS_AMOUNT, COMPUTER } from '../constants';
import { executeMove, findMoves, getCaptureMoves, getDirections } from '../helpers';

// Inclusive at minimum, exclusive at maximum
function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

class RandomPlayer {
  static name = 'random';

  constructor(boardData, cellCount, ownCells) {
    this.board = boardData;
    this.cellCount = cellCount;
    this.cells = ownCells;
    this.name = RandomPlayer.name;
  }

  updateInfo(boardData) {
    this.board = boardData;

    let currentCells = [];

    for (let i = 0; i < BOARD_SIZE; i += 1) {
      for (let j = 0; j < BOARD_SIZE; j += 1) {
        if (boardData[i][j].owner === COMPUTER) {
          currentCells.push({ data: { ...boardData[i][j] }, rowIndex: i, columnIndex: j });
        }
      }
    }

    this.cells = currentCells;
    this.cellCount = currentCells.length;
  }

  // 1. Find any next possible move
  //  1.1 Check if this move has any multiple jumps possible, if yes then continue jumps
  // 2. Execute the move
  // 3. Update Board
  // 4. Return new board
  findNextMove() {
    let moveFound = false;
    let kingMade = false;
    let captureMade = false;
    let boardCopy = cloneDeep(this.board);

    if (this.cells.length === 0) {
      return {
        board: boardCopy,
        kingMade,
        captureMade,
      };
    }

    while (!moveFound) {
      // Find any move which can be executed

      // If there is a move which can capture, only find random cell from that

      const movesHavingCaptures = [];
      this.cells.forEach((cellData) => {
        const directions = getDirections(
          cellData.rowIndex,
          cellData.columnIndex,
          boardCopy,
          COMPUTER
        );
        const captures = getCaptureMoves(
          cellData.rowIndex,
          cellData.columnIndex,
          boardCopy,
          directions,
          COMPUTER
        );

        if (captures.length > 0) {
          movesHavingCaptures.push(cellData);
        }
      });

      let randomIndex;
      let initCell;
      if (movesHavingCaptures.length > 0) {
        // Move exist which can capture cells, so only use those
        randomIndex = getRandomNumber(0, movesHavingCaptures.length);
        initCell = movesHavingCaptures[randomIndex];
      } else {
        randomIndex = getRandomNumber(0, this.cells.length);
        initCell = this.cells[randomIndex];
      }

      const possibleNextMoves = findMoves(
        initCell.rowIndex,
        initCell.columnIndex,
        boardCopy,
        COMPUTER
      );

      if (possibleNextMoves.length > 0) {
        // This cell has some valid moves
        // So try any move from its possible moves

        if (moveFound) {
          break;
        }

        // This cell becomes active
        boardCopy[initCell.rowIndex][initCell.columnIndex].isActive = true;

        moveFound = true;

        const randIndex = getRandomNumber(0, possibleNextMoves.length);
        const moveToPlay = possibleNextMoves[randIndex];

        // Play that move and a get a new board state
        let moveExecuted = false;
        let destX = moveToPlay[0];
        let destY = moveToPlay[1];

        while (!moveExecuted) {
          const executeResponse = executeMove(destX, destY, boardCopy, COMPUTER);

          // Update board with new info
          boardCopy = executeResponse.boardData;

          if (executeResponse.captureMade) {
            captureMade = true;
            //make the current cell active
          }

          if (executeResponse.kingMade) {
            kingMade = true;
            //make the current cell active
          }

          if (executeResponse.hasAnotherJump) {
            // Keep repeating steps
            // Need to update to which index should the next execution be
            // board[destX][destY].hasAnotherJump = true

            // Find next moves for this cell
            const nxtMoves = findMoves(destX, destY, boardCopy, COMPUTER);

            // Update new final capture position ( multiple jump case )

            boardCopy[destX][destY].isActive = true;

            destX = nxtMoves[0][0];
            destY = nxtMoves[0][1];
          }

          if (!executeResponse.hasAnotherJump) {
            moveExecuted = true;
          }

          if (moveExecuted) {
            break;
          }
        }

        if (moveFound) {
          break;
        }
      }

      if (moveFound) {
        break;
      }
    }

    return {
      board: boardCopy,
      kingMade,
      captureMade,
    };
  }
}

export default RandomPlayer;
