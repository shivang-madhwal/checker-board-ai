import { cloneDeep } from 'lodash';
import { PLAYER_1, COMPUTER, DEPTH } from '../constants';
import {
  findMoves,
  getDiscPositions,
  executeMove,
  getGameState,
  getCapturablePositions,
} from '../helpers';

const calculateUtility = (board) => {
  let playerDiscs = 0;
  let aiDiscs = 0;
  let playerKings = 0;
  let aiKings = 0;

  for (const row of board) {
    for (const { owner, isKing } of row) {
      if (owner == PLAYER_1) {
        if (isKing) {
          playerKings++;
        } else {
          playerDiscs++;
        }
      } else if (owner == COMPUTER) {
        if (isKing) {
          aiKings++;
        } else {
          aiDiscs++;
        }
      }
    }
  }

  return (aiKings - playerKings) * 2 + (aiDiscs - playerDiscs);
};

class MiniMaxPlayer {
  static name = 'minimax';

  constructor() {
    this.name = MiniMaxPlayer.name;
  }

  minimax = (_board, depth, isMin, turnCount, lkmat, lcat, player) => {
    // console.log('------ MINIMAX CALLED ------------');
    // console.log(depth, isMin, turnCount, player);

    const state = getGameState(_board, turnCount, lkmat, lcat, player);

    // console.log('inside minimax game state', state, depth, _board);

    if (depth == 0 || state.isGameWon || state.isGameDraw) {
      return [calculateUtility(_board), _board, turnCount, lkmat, lcat];
    }

    const board = cloneDeep(_board);

    // console.log('new board', board);

    let bestMoveBoard;
    let candidateUtility = isMin ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

    let boardToReturn = cloneDeep(board);
    let lastKingMadeAtToReturn = lkmat;
    let lastCaptureMadeAtToReturn = lcat;

    // we're checking all the next possible moves
    for (const bestMoveBoardCandidate of this.getAllBoards(board, isMin ? PLAYER_1 : COMPUTER)) {
      // for ith possible move, we're checking for the next depth - 1 moves

      // console.log('next board candidate', bestMoveBoardCandidate);

      let nlkmat = lkmat;
      let nlcat = lcat;

      if (bestMoveBoardCandidate.kingMade) {
        nlkmat = turnCount;
      }

      if (bestMoveBoardCandidate.captureMade) {
        nlcat = turnCount;
      }

      const utility = this.minimax(
        bestMoveBoardCandidate.board,
        depth - 1,
        !isMin,
        turnCount + 1,
        nlkmat,
        nlcat,
        isMin ? PLAYER_1 : COMPUTER
      )[0];

      // we're updating the min utility
      if (isMin) {
        candidateUtility = Math.min(candidateUtility, utility);
      } else {
        candidateUtility = Math.max(candidateUtility, utility);
      }
      // console.log('new calculated utility', utility, candidateUtility);

      // if the minUtility is same as utility, that means we have our best move board
      if (candidateUtility === utility) {
        bestMoveBoard = cloneDeep(bestMoveBoardCandidate.board);
        boardToReturn = cloneDeep(bestMoveBoardCandidate.board);
        lastKingMadeAtToReturn = nlkmat;
        lastCaptureMadeAtToReturn = nlcat;
      }
    }

    // return [calculateUtility(_board), _board, turnCount, lkmat, lcat];
    return [
      candidateUtility,
      boardToReturn,
      turnCount,
      lastKingMadeAtToReturn,
      lastCaptureMadeAtToReturn,
    ];
  };

  /**
   * Returns the next board positions for all player's valid next moves
   * If there are some which have captures available, then only find the next boards
   * for those specific cells
   */

  getAllBoards = (_board, player) => {
    // console.log('INSIDE GET ALL BOARDS');

    // if (player === COMPUTER) {
    //   console.log('Computer TURN');
    // } else {
    //   console.log('PLAYER TURN');
    // }

    const board = cloneDeep(_board);

    const boards = [];

    const { allCapturablesMoves, startPositions } = getCapturablePositions(board, player);

    let totalPositions;

    // console.log('all capturing, start positions', allCapturablesMoves, startPositions);

    if (allCapturablesMoves.length > 0) {
      // some move exists which can capture
      // So only play from that
      totalPositions = startPositions;
    } else {
      totalPositions = getDiscPositions(board, player);
    }

    // console.log('total positions', totalPositions);
    // console.log('player ', player);

    for (const piece of totalPositions) {
      const [i, j] = piece;
      const validMoves = findMoves(i, j, board, player);

      // console.log('all valid moves', i, j, validMoves);

      for (const move of validMoves) {
        let boardCopy = cloneDeep(board);
        let moveExecuted = false;
        boardCopy[i][j].isActive = true;
        let destX = move[0];
        let destY = move[1];
        let kingMade = false;
        let captureMade = false;

        while (!moveExecuted) {
          const executeResponse = executeMove(destX, destY, boardCopy, player);

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
            const nxtMoves = findMoves(destX, destY, boardCopy, player);

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

        boards.push({
          board: boardCopy,
          captureMade,
          kingMade,
        });
      }
    }

    // No valid next positions available
    if (boards.length === 0) {
      return boards;
    }

    // calculate the possible moves
    return boards;
  };

  findNextMove = (_board, { turnCount, lkmat, lcat, player }) => {
    // call minimax here and get the new board and the other stuff
    [calculateUtility(_board), _board, turnCount, lkmat, lcat];

    // console.log('inside find next move');

    const [maxUtility, board, tc, lastKingMadeAt, lastCaptureMadeAt] = this.minimax(
      _board,
      DEPTH,
      false,
      turnCount,
      lkmat,
      lcat,
      player
    );

    // console.log('returned from minimax', board, tc);

    // console.log('got result back');

    let kingMade = false;
    let captureMade = false;
    if (lastKingMadeAt >= turnCount) {
      kingMade = true;
    }

    if (lastCaptureMadeAt >= turnCount) {
      captureMade = true;
    }
    return {
      board,
      kingMade,
      captureMade,
    };
  };
}

export default MiniMaxPlayer;
