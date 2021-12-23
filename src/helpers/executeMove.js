import { cloneDeep } from 'lodash';
import { getCaptureMoves } from '.';
import { BOARD_SIZE, COMPUTER, PLAYER_1, PLAYER_2 } from '../constants';
import { getCleanBoard, getDirections, getInitialCellState, isValidDirection } from './utils';

const findCorrectDirection = (initX, initY, rowIndex, columnIndex, boardData, currentPlayer) => {
  const directions = getDirections(initX, initY, boardData, currentPlayer);

  // Find the correct direction of isActive Cell towards current cell

  let dir = [];
  directions.forEach((direction) => {
    if (isValidDirection(initX, initY, rowIndex, columnIndex, direction)) {
      dir = direction;
    }
  });

  return dir;
};

const createResponse = (boardData, hasAnotherJump, kingMade, captureMade) => {
  return {
    boardData,
    hasAnotherJump,
    kingMade,
    captureMade,
  };
};

export const executeMove = (rowIndex, columnIndex, boardData, currentPlayer) => {
  // Find that one cell which has isActive flag set to true
  const board = cloneDeep(boardData);

  let i, j;
  let found = false;
  for (i = 0; i < BOARD_SIZE; i++) {
    for (j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j].isActive) {
        found = true;
        break;
      }
    }
    if (found) {
      break;
    }
  }

  // Go from (i,j) to (rowIndex, columnIndex)
  // Delete the enemy cell in the way ( if existing )

  const dir = findCorrectDirection(i, j, rowIndex, columnIndex, board, currentPlayer);

  // console.log('found correct direction', dir);

  const nextX = i + dir[0];
  const nextY = j + dir[1];

  // Original cell should now become empty

  // Change position of cell to new index
  board[rowIndex][columnIndex] = {
    owner: board[i][j].owner,
    isKing: board[i][j].isKing,
    isValidNextMove: false,
    isActive: false,
    hasAnotherJump: false,
  };

  let playedAdjacent = false;
  let captureMade = false;

  if (nextX == rowIndex && columnIndex == nextY) {
    // moved to adjacent cell
    playedAdjacent = true;
  } else {
    // Capture is successful, make middle position empty
    board[nextX][nextY] = getInitialCellState();
    captureMade = true;
  }

  // Reset the cell from which execution started
  board[i][j] = getInitialCellState();

  // Resets any remaining isValids, possible captures etc
  const cleanedBoard = getCleanBoard(board);

  let kingMadeInMove = false;

  // Check to see if any cell has become king or not
  // For Player 1 Cells
  // Check inside the 0'th row
  for (let i = 0; i < BOARD_SIZE; i += 1) {
    if (cleanedBoard[0][i].owner == PLAYER_1) {
      // Player 1 cells reached last position, make it king cell
      cleanedBoard[0][i].isKing = true;

      if (rowIndex == 0 && columnIndex == i) {
        kingMadeInMove = true;
      }
    }
  }

  // For Player 2 / Computer Cells
  // Check inside the BOARD_SIZE -  1'th row
  for (let i = 0; i < BOARD_SIZE; i += 1) {
    if (
      cleanedBoard[BOARD_SIZE - 1][i].owner == COMPUTER ||
      cleanedBoard[BOARD_SIZE - 1][i].owner == PLAYER_2
    ) {
      // Player 2 or comuters cells reached last position, make it king cell
      cleanedBoard[BOARD_SIZE - 1][i].isKing = true;

      if (rowIndex == BOARD_SIZE - 1 && columnIndex == i) {
        kingMadeInMove = true;
      }
    }
  }

  // As king was made in this turn, cannot make multiple jumps
  if (kingMadeInMove) {
    return createResponse(cleanedBoard, false, kingMadeInMove, captureMade);
  }

  // If played adjacent, no need to check for further capturing jumps
  if (playedAdjacent) {
    return createResponse(cleanedBoard, false, kingMadeInMove, false);
  }

  // Check if this cell has another capturing move or not
  const directions = getDirections(rowIndex, columnIndex, cleanedBoard, currentPlayer);
  const newCaptures = getCaptureMoves(
    rowIndex,
    columnIndex,
    cleanedBoard,
    directions,
    currentPlayer
  );

  if (newCaptures.length > 0) {
    // This cell has another capturing move available, so it will make multiple jumps
    cleanedBoard[rowIndex][columnIndex].hasAnotherJump = true;
    return createResponse(cleanedBoard, true, false, true);
  } else {
    // move does not have any more capturing moves
    return createResponse(cleanedBoard, false, false, true);
  }
};
