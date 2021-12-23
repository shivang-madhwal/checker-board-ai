import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Board from './components/Board';
import {
  changeTurnCountByAmount,
  changeWhoseTurn,
  initializeGame,
  selectBoard,
  selectCaptureMadeAt,
  selectKingMadeAt,
  selectLoading,
  selectMoveList,
  selectOpponent,
  selectTurnCount,
  selectWhoseTurn,
  setBoard,
  setCaptureMadeAt,
  setKingMadeAt,
  setLoading,
} from './features/game/gameSlice';
import GameState from './components/GameState';
import { getGameState, highlightCapturingMoves } from './helpers';
import { CELLS_AMOUNT, COMPUTER, DEPTH, PLAYER_1, PLAYER_2 } from './constants';
import { RandomPlayer, MiniMaxPlayer } from './gameAgents';

const getAIFromName = (name) => {
  switch (name) {
    case RandomPlayer.name:
      return new RandomPlayer();
    case MiniMaxPlayer.name:
      return new MiniMaxPlayer(DEPTH);
    default:
      return null;
  }
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState('');
  const [agentType, setAgentType] = useState('minimax');
  const agent = useRef(null);

  const dispatch = useDispatch();
  const board = useSelector(selectBoard);
  const loading = useSelector(selectLoading);
  const currentPlayer = useSelector(selectWhoseTurn);
  const turnCount = useSelector(selectTurnCount);
  const lastKingMadeAt = useSelector(selectKingMadeAt);
  const lastCaptureMadeAt = useSelector(selectCaptureMadeAt);
  const opponent = useSelector(selectOpponent);

  const [highlightedBoard, setHighlightedBoard] = useState(board);

  const initialize = (againstWhom) => {
    // console.log('against whom', againstWhom);
    if (againstWhom === 'player2') {
      dispatch(
        initializeGame({
          againstWhom: PLAYER_2,
        })
      );
    } else {
      agent.current = getAIFromName(agentType);
      dispatch(
        initializeGame({
          againstWhom: COMPUTER,
        })
      );
    }

    setGameStarted(true);
    setGameFinished(false);
  };

  useEffect(() => {
    if (board) {
      const boardWithCapureHighligted = highlightCapturingMoves(board, currentPlayer);
      setHighlightedBoard(boardWithCapureHighligted);
    }
  }, [board]);

  useEffect(() => {
    if (!gameFinished) {
      if (currentPlayer == COMPUTER) {
        let data;
        if (agent.current.name === MiniMaxPlayer.name) {
          data = agent.current.findNextMove(board, {
            turnCount,
            lkmat: lastKingMadeAt,
            lcat: lastCaptureMadeAt,
            player: currentPlayer,
          });
        } else {
          agent.current.updateInfo(board);
          data = agent.current.findNextMove();
        }

        if (data.kingMade) {
          dispatch(setKingMadeAt(turnCount));
        }

        if (data.captureMade) {
          dispatch(setCaptureMadeAt(turnCount));
        }

        dispatch(setBoard(data.board));
        dispatch(changeTurnCountByAmount(1));
        dispatch(changeWhoseTurn(PLAYER_1));
      }
    }

    if (gameStarted) {
      const gameState = getGameState(board, turnCount, lastKingMadeAt, lastCaptureMadeAt, opponent);

      // console.log('game state app.jsx', gameState);

      if (gameState.isGameWon) {
        setGameFinished(true);
        if (gameState.whoseWinner === PLAYER_1) {
          setWinner('PLAYER 1');
        }

        if (gameState.whoseWinner === PLAYER_2) {
          setWinner('PLAYER 2');
        }

        if (gameState.whoseWinner === COMPUTER) {
          setWinner('COMPUTER');
        }
      }

      if (gameState.isGameDraw) {
        setGameFinished(true);
        setWinner('Draw');
      }
    }
  }, [currentPlayer]);

  return (
    <div className="container">
      {loading && <div>App is loading right now</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Checkers</h1>
        <div>
          <select
            style={{
              padding: '0.3rem',
              marginRight: '1rem',
              fontSize: '1rem',
              borderRadius: '0.25rem',
            }}
            disabled={gameStarted}
            value={agentType}
            onChange={(e) => setAgentType(e.target.value)}
          >
            <option value="player2">Player 2</option>
            <option value="random">Random</option>
            <option value="minimax">MiniMax</option>
          </select>
          <button className="btn-primary mt-4" onClick={() => initialize(agentType)}>
            {gameStarted ? 'Reset' : 'Start'}
          </button>
        </div>
      </div>
      <GameState gameStarted={gameStarted} gameFinished={gameFinished} winner={winner} />
      <div className="board-and-moves-container">
        {!gameFinished && <Board boardData={highlightedBoard} />}
      </div>
    </div>
  );
}

export default App;
