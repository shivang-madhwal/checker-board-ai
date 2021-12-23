import { createSlice } from '@reduxjs/toolkit';
import { BOARD_SIZE, CELLS_AMOUNT, COMPUTER, EMPTY, PLAYER_1, PLAYER_2 } from '../../constants';

const initialCellState = {
  owner: EMPTY,
  isValidNextMove: false,
  isKing: false,
  isActive: false,
  hasPossibleCapture: false,
  hasAnotherJump: false,
};

const initialState = {
  board: [],
  playerOneMoves: [],
  loading: false,
  playerOneCells: CELLS_AMOUNT,
  playerTwoCells: CELLS_AMOUNT,
  opponentCells: CELLS_AMOUNT,
  kingMadeAt: 0,
  captureMadeAt: 0,
  turnCount: 0,
  whoseTurn: PLAYER_1,
  opponent: PLAYER_2,
};

const createNewBoard = (initializeInfo) => {
  // console.log(' inside create new board', initializeInfo);

  let board = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    let row = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      row.push({ ...initialCellState });
    }
    board.push(row);
  }

  // Player 2
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if ((i + j) % 2 == 0) {
        board[i][j].owner = initializeInfo.againstWhom;
      }
    }
  }

  // Player 1
  for (let i = BOARD_SIZE - 3; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if ((i + j) % 2 == 0) {
        board[i][j].owner = PLAYER_1;
      }
    }
  }

  return board;
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: {
      reducer(state, { payload }) {
        state.board = payload.board;
        state.loading = payload.loading;
        state.playerOneCells = payload.playerOneCells;
        state.playerTwoCells = payload.playerTwoCells;
        state.opponentCells = payload.opponentCells;
        state.turnCount = payload.turnCount;
        state.whoseTurn = payload.whoseTurn;
        state.kingMadeAt = payload.kingMadeAt;
        state.captureMadeAt = payload.captureMadeAt;
        state.opponent = payload.opponent;
      },
      prepare(initializeInfo) {
        return {
          payload: {
            board: createNewBoard(initializeInfo),
            loading: false,
            playerOneCells: CELLS_AMOUNT,
            playerTwoCells: CELLS_AMOUNT,
            opponentCells: CELLS_AMOUNT,
            turnCount: 0,
            whoseTurn: PLAYER_1,
            kingMadeAt: 0,
            captureMadeAt: 0,
            opponent: initializeInfo.againstWhom,
          },
        };
      },
    },
    handlePlayerInput(state, action) {
      state.playerOneMoves.push(action.payload.moveCoordinates);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    changePlayerOneCells(state, action) {
      state.playerOneCells = action.payload;
    },
    changePlayerTwoCells(state, action) {
      state.playerTwoCells = action.payload;
    },
    changeOpponentCells(state, action) {
      state.opponentCells = action.payload;
    },
    setBoard(state, action) {
      state.board = action.payload;
    },
    changeTurnCountByAmount(state, action) {
      state.turnCount += action.payload;
    },
    changeWhoseTurn(state, action) {
      state.whoseTurn = action.payload;
    },
    setKingMadeAt(state, action) {
      state.kingMadeAt = action.payload;
    },
    setCaptureMadeAt(state, action) {
      state.captureMadeAt = action.payload;
    },
    setOpponent(state, action) {
      state.opponent = action.payload;
    },
  },
});

export const {
  setLoading,
  handlePlayerInput,
  initializeGame,
  changeOpponentCells,
  changePlayerOneCells,
  changePlayerTwoCells,
  setBoard,
  changeTurnCountByAmount,
  changeWhoseTurn,
  setKingMadeAt,
  setCaptureMadeAt,
  setOpponent,
} = gameSlice.actions;

export const selectBoard = (state) => state.game.board;
export const selectMoveList = (state) => state.game.playerOneMoves;
export const selectLoading = (state) => state.game.loading;
export const selectWhoseTurn = (state) => state.game.whoseTurn;
export const selectTurnCount = (state) => state.game.turnCount;
export const selectKingMadeAt = (state) => state.game.kingMadeAt;
export const selectCaptureMadeAt = (state) => state.game.captureMadeAt;
export const selectOpponent = (state) => state.game.opponent;

export default gameSlice.reducer;
