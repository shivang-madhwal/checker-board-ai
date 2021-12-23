import { cloneDeep } from 'lodash';
import { getCaptureMoves } from '.';
import { BOARD_SIZE, EMPTY, PLAYER_1, PLAYER_2, COMPUTER } from '../constants';

export const getInitialCellState = () => {
  return {
    owner: EMPTY,
    isActive: false,
    isValidNextMove: false,
    isKing: false,
    hasPossibleCapture: false,
  };
};

export const getDiscPositions = (board, player) => {
  const positions = [];
  for (let i = 0; i < board.length; ++i) {
    const row = board[i];
    for (let j = 0; j < row.length; ++j) {
      const elem = row[j];
      if (elem.owner === player) {
        positions.push([i, j]);
      }
    }
  }
  return positions;
};

/*
Get all directions for provided cell
*/

export const getDirections = (rowIndex, columnIndex, board, currentPlayer) => {
  let directions = [];
  // console.log('inside get directions', rowIndex, columnIndex, board, currentPlayer);
  if (currentPlayer == PLAYER_1) {
    directions.push([-1, -1]);
    directions.push([-1, 1]);
    if (board[rowIndex][columnIndex].isKing) {
      // Also check for backward position
      directions.push([1, -1]);
      directions.push([1, 1]);
    }
  } else {
    directions.push([1, -1]);
    directions.push([1, 1]);
    if (board[rowIndex][columnIndex].isKing) {
      // Also check for backward position
      directions.push([-1, -1]);
      directions.push([-1, 1]);
    }
  }
  return directions;
};

/*
Returns if it is possible to reach (destX,destY) from (srcX, srcY) using provided direction 
*/
export const isValidDirection = (initialX, initialY, destinationX, destinationY, direction) => {
  for (let i = 0; i < 2; i += 1) {
    initialX += direction[0];
    initialY += direction[1];

    if (!isValidIndex(initialX, initialY)) {
      return false;
    }

    if (initialX === destinationX && initialY === destinationY) {
      return true;
    }
  }

  return false;
};

export const isValidIndex = (row, col) => {
  if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    return true;
  }
  return false;
};

/*
Resets isActive, isValidNextMove, hasPossible capture flags to reset the board display

Used to 'clean' the board of previous conditions
*/
export const getCleanBoard = (boardData) => {
  const board = cloneDeep(boardData);
  for (let i = 0; i < BOARD_SIZE; i += 1) {
    for (let j = 0; j < BOARD_SIZE; j += 1) {
      board[i][j].isValidNextMove = false;
      board[i][j].isActive = false;
      board[i][j].hasPossibleCapture = false;
    }
  }
  return board;
};

/*
Returns all the capturing positions that a board has wrt current player
*/
export const getCapturablePositions = (board, currentPlayer) => {
  let allCapturablesMoves = [];
  let startPositions = [];

  if (board.length === 0) {
    return { allCapturablesMoves, startPositions };
  }

  for (let i = 0; i < BOARD_SIZE; i += 1) {
    for (let j = 0; j < BOARD_SIZE; j += 1) {
      if (board[i][j].owner === currentPlayer) {
        // Finds all the indexes on which it can capture
        const directions = getDirections(i, j, board, currentPlayer);
        const curCapturablesMoves = getCaptureMoves(i, j, board, directions, currentPlayer);
        if (curCapturablesMoves.length > 0) {
          startPositions.push([i, j]);
          allCapturablesMoves = [...allCapturablesMoves, ...curCapturablesMoves];
        }
      }
    }
  }

  return { allCapturablesMoves, startPositions };
};

export const getCheckerPieceClass = (data) => {
  const classList = ['checker__piece'];

  if (data.owner === PLAYER_1) {
    classList.push('checker__piece--first');
  }

  if (data.owner === PLAYER_2) {
    classList.push('checker__piece--second');
  }

  if (data.owner === COMPUTER) {
    classList.push('checker__piece--second');
  }

  if (data.isKing && data.owner != EMPTY) {
    classList.push('checker__piece--king');
  }

  if (data.isActive) {
    classList.push('checker__piece--active');
  }

  if (data.isValidNextMove) {
    classList.push('checker__piece--valid_move');
  }

  if (data.hasPossibleCapture) {
    classList.push('checker__piece--possible_capture');
  }

  if (data.hasAnotherJump) {
    classList.push('checker__piece--another_jump');
  }

  return classList.join(' ');
};
