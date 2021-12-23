import { cloneDeep } from 'lodash';
import { getCapturablePositions, getCaptureMoves, getDirections } from '.';
import { BOARD_SIZE, EMPTY } from '../constants';
import { executeMove } from './executeMove';
import { highlightMoves } from './highlightMoves';

const createResponse = (
  boardData,
  isSuccessful = false,
  wasExecuted = false,
  wasKingMade = false,
  wasCaptureMade = false
) => {
  return {
    boardData,
    isSuccessful,
    wasExecuted,
    wasKingMade,
    wasCaptureMade,
  };
};

export const handleClick = (rowIndex, columnIndex, boardData, currentPlayer) => {
  const board = cloneDeep(boardData);
  const cellData = board[rowIndex][columnIndex];

  // This handles user click on an empty cell, and specifically on that empty cell who is confirmed to be not a valid next move
  if (cellData.owner === EMPTY && !cellData.isValidNextMove) {
    return createResponse(board, false, false);
  }

  // Or they clicked on a cell not their own, (and the cell was not empty)
  if (cellData.owner != currentPlayer && cellData.owner != EMPTY) {
    return createResponse(board, false, false);
  }

  // Get all capturables moves possible for current player
  const { allCapturablesMoves, startPositions } = getCapturablePositions(board, currentPlayer);

  // Mark's all the capturing moves available
  // startPositions.forEach((move) => {
  //   board[move[0]][move[1]].hasPossibleCapture = true;
  // });

  // If capturing positions are available, force the user to only play on those positions
  // If a capturing move has another capturing move available, user must play that to completion

  if (allCapturablesMoves.length > 0) {
    // There is some capturable move available

    // Check if any of the cells has another jump set to true
    // If yes, only force that to be played, as this is the multiple jumping cell
    let i = 0;
    let j = 0;
    let multiJumpCaptures = [];
    let exists = false;
    for (i = 0; i < BOARD_SIZE; i += 1) {
      for (j = 0; j < BOARD_SIZE; j += 1) {
        if (board[i][j].owner === currentPlayer) {
          if (board[i][j].hasAnotherJump) {
            exists = true;
            const directions = getDirections(i, j, board, currentPlayer);
            multiJumpCaptures = getCaptureMoves(i, j, board, directions, currentPlayer);
            break;
          }
        }
        if (exists) {
          break;
        }
      }
      if (exists) {
        break;
      }
    }

    if (exists) {
      // console.log('has another jump', multiJumpCaptures);
      // console.log('i, j, row, col', i, j, rowIndex, columnIndex);

      if (multiJumpCaptures.some((move) => move[0] === rowIndex && move[1] === columnIndex)) {
        // Played at some point which the has another jump cell can make

        const data = executeMove(rowIndex, columnIndex, board, currentPlayer);

        // As the cell has another capture available,
        // We make it so that player has to finish playing it
        if (data.hasAnotherJump) {
          return createResponse(data.boardData, true, false, data.kingMade);
        }

        // No multiple jump possible
        // So turn executed successfully
        return createResponse(data.boardData, true, true, data.kingMade, true);
      } else if (i === rowIndex && j === columnIndex) {
        // Played on the cell which was has another jump set to true
        // Highlights all its possibe captures

        const highlighedBoard = highlightMoves(board, rowIndex, columnIndex, currentPlayer);
        return createResponse(highlighedBoard, true, false, false);
      } else {
        // User had to forcefully play at either the has another jump cell itself
        // Or the position it could finally be in
        // He played neither of those
        // So ignore his click

        return createResponse(board, false, false, false);
      }
    }

    if (allCapturablesMoves.some((move) => move[0] === rowIndex && move[1] === columnIndex)) {
      // User played a capturable move

      const data = executeMove(rowIndex, columnIndex, board, currentPlayer);

      // As the cell has another capture available,
      // We make it so that player has to finish playing it
      if (data.hasAnotherJump) {
        return createResponse(data.boardData, true, false, data.kingMade);
      }

      // No multiple jump possible
      // So turn executed successfully
      return createResponse(data.boardData, true, true, data.kingMade, true);
    }

    if (startPositions.some((move) => move[0] === rowIndex && move[1] === columnIndex)) {
      // User played a move which is a valid start position for a capturable move
      // So make it active, and show all capturable moves it has available

      const highlighedBoard = highlightMoves(board, rowIndex, columnIndex, currentPlayer);
      return createResponse(highlighedBoard, true, false);
    }

    // User did not play on a cell who can be captured, or on a cell which was a start position
    // for some cell which could be captured
    // So basically ignore his click
    return createResponse(board, false, false, false);
  }

  // Clicked on a cell whose is-valid-next-move is true
  // This functions only runs when there is no capturing move available
  // Now execute that move
  if (cellData.isValidNextMove) {
    const data = executeMove(rowIndex, columnIndex, board, currentPlayer);
    return createResponse(data.boardData, true, true, data.kingMade);
  }

  // If nothing above, user just clicked on his own cell
  // This will show all the next possible valid positions from this cell
  // modify board adding cells which can be the next possible move
  const highlighedBoard = highlightMoves(board, rowIndex, columnIndex, currentPlayer);
  return createResponse(highlighedBoard, true);
};
