import { cloneDeep } from 'lodash';

import { findMoves } from './findHelpers';
import { BOARD_SIZE, PLAYER_1, COMPUTER, PLAYER_2, DRAW, GAME_END } from '../constants';

const createResponse = (
  playerOneCount,
  playerTwoCount,
  computerCount,
  isGameWon,
  whoseWinner,
  isGameDraw,
  continueGame = false
) => {
  return {
    playerOneCount,
    playerTwoCount,
    computerCount,
    isGameWon,
    whoseWinner,
    isGameDraw,
    continueGame,
  };
};

/*  
win conditions
    1. all the pieces of opponent are captured
    2. opponent can't make a valid move 

draw conditions
    1. Neither player has advanced an uncrowned man towards the king-row during the previous 50 moves
    2. No pieces have been removed from the board during the previous 50 moves.
*/
export const getGameState = (boardData, turnCount, lastKingMadeAt, lastCaptureAt, opponent) => {
  if (!boardData) {
    // if board data is empty, handle separately
    createResponse(0, 0, 0, false, 0, false, true);
  }

  // Check if all cells are of one type
  const board = cloneDeep(boardData);
  let playerOneCount = 0;
  let playerTwoCount = 0;
  let computerCount = 0;
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j].owner === PLAYER_1) {
        playerOneCount += 1;
      }

      if (board[i][j].owner === PLAYER_2) {
        playerTwoCount += 1;
      }

      if (board[i][j].owner === COMPUTER) {
        computerCount += 1;
      }
    }
  }

  // Handles cases of all cells being used up
  if (playerOneCount === 0) {
    // Player 1 has lost
    // Opponent has Won
    return createResponse(
      playerOneCount,
      playerTwoCount,
      computerCount,
      true,
      opponent,
      false,
      false
    );
  }

  if (playerTwoCount === 0) {
    if (opponent === PLAYER_2) {
      // Player two lost
      return createResponse(
        playerOneCount,
        playerTwoCount,
        computerCount,
        true,
        PLAYER_1,
        false,
        false
      );
    }
  }

  if (computerCount === 0) {
    if (opponent === COMPUTER) {
      // Computer lost
      return createResponse(
        playerOneCount,
        playerTwoCount,
        computerCount,
        true,
        PLAYER_1,
        false,
        false
      );
    }
  }

  // Handles case of if any remaining playable moves exist
  let hasMovesPlayerOne = false;
  let hasMovesPlayerTwo = false;
  let hasMovesComputer = false;
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j].owner == PLAYER_1 && !hasMovesPlayerOne) {
        const possMoves = findMoves(i, j, board, PLAYER_1);
        if (possMoves.length > 0) {
          hasMovesPlayerOne = true;
        }
      }

      if (board[i][j].owner == PLAYER_2 && !hasMovesPlayerTwo) {
        const possMoves = findMoves(i, j, board, PLAYER_2);
        if (possMoves.length > 0) {
          hasMovesPlayerTwo = true;
        }
      }

      if (board[i][j].owner == COMPUTER && !hasMovesComputer) {
        const possMoves = findMoves(i, j, board, COMPUTER);
        if (possMoves.length > 0) {
          hasMovesComputer = true;
        }
      }
    }
  }

  if (!hasMovesPlayerOne) {
    // Player 1 has lost, as it does not have any moves left
    return createResponse(
      playerOneCount,
      playerTwoCount,
      computerCount,
      true,
      opponent,
      false,
      false
    );
  }

  if (!hasMovesPlayerTwo) {
    if (opponent === PLAYER_2) {
      // Player two lost, as it does have any moves left
      return createResponse(
        playerOneCount,
        playerTwoCount,
        computerCount,
        true,
        PLAYER_1,
        false,
        false
      );
    }
  }

  if (!hasMovesComputer) {
    if (opponent === COMPUTER) {
      // Computer lost, as it does not have any moves left
      return createResponse(
        playerOneCount,
        playerTwoCount,
        computerCount,
        true,
        PLAYER_1,
        false,
        false
      );
    }
  }

  // Handles draw conditions
  if (turnCount - lastCaptureAt >= 50 || turnCount - lastKingMadeAt >= 50) {
    return createResponse(playerOneCount, playerTwoCount, computerCount, false, -1, true, false);
  }

  return createResponse(playerOneCount, playerTwoCount, computerCount, false, -1, false, true);
};
