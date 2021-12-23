import { EMPTY, PLAYER_1 } from '../constants';
import { cloneDeep } from 'lodash';
import { isValidIndex, isValidDirection, getDirections } from './utils';

export const getCaptureMoves = (rowIndex, columnIndex, board, directions, currentPlayer) => {
  const possibleCaptureMoves = [];
  for (let i = 0; i < directions.length; i++) {
    const midX = rowIndex + directions[i][0];
    const midY = columnIndex + directions[i][1];

    const destX = rowIndex + directions[i][0] * 2;
    const destY = columnIndex + directions[i][1] * 2;

    if (isValidIndex(destX, destY) && isValidIndex(midX, midY)) {
      const destinationCell = board[destX][destY];
      const middleCell = board[midX][midY];
      const isMiddleEnemy = middleCell.owner != currentPlayer && middleCell.owner != EMPTY;

      if (destinationCell.owner == EMPTY && isMiddleEnemy) {
        possibleCaptureMoves.push([destX, destY]);
      }
    }
  }
  return possibleCaptureMoves;
};

export const getAdjacentMoves = (rowIndex, columnIndex, board, directions) => {
  let moves = [];

  for (let i = 0; i < directions.length; i++) {
    const destX = rowIndex + directions[i][0];
    const destY = columnIndex + directions[i][1];

    if (isValidIndex(destX, destY)) {
      const destinationCell = board[destX][destY];
      if (destinationCell.owner == EMPTY) {
        moves.push([destX, destY]);
      }
    }
  }

  return moves;
};

/*
Returns an array of the next possible moves for provided indexes
*/
export const findMoves = (rowIndex, columnIndex, boardData, currentPlayer) => {
  let possibleMoves = [];
  const board = cloneDeep(boardData);
  const directions = getDirections(rowIndex, columnIndex, boardData, currentPlayer);

  const capMoves = getCaptureMoves(rowIndex, columnIndex, board, directions, currentPlayer);
  if (capMoves.length > 0) {
    possibleMoves = capMoves;
    return possibleMoves;
  }

  const adjMoves = getAdjacentMoves(rowIndex, columnIndex, board, directions);

  possibleMoves = [...adjMoves, ...capMoves];
  return possibleMoves;
};
