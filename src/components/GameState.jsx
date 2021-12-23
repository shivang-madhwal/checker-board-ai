import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { COMPUTER, PLAYER_1, PLAYER_2 } from '../constants';
import {
  selectTurnCount,
  selectWhoseTurn,
  selectBoard,
  selectLoading,
  selectKingMadeAt,
  selectCaptureMadeAt,
  selectOpponent,
} from '../features/game/gameSlice';
import { getGameState } from '../helpers';

const GameState = ({ gameStarted, gameFinished, winner }) => {
  const whoseTurn = useSelector(selectWhoseTurn);
  const board = useSelector(selectBoard);

  const loading = useSelector(selectLoading);
  const currentPlayer = useSelector(selectWhoseTurn);
  const turnCount = useSelector(selectTurnCount);
  const lastKingMadeAt = useSelector(selectKingMadeAt);
  const lastCaptureMadeAt = useSelector(selectCaptureMadeAt);
  const opponent = useSelector(selectOpponent);

  const [cellCountOne, setCellCountOne] = useState(0);
  const [cellCountTwo, setCellCountTwo] = useState(0);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [playerName, setPlayerName] = useState('');
  // const [winName, setSetWinName] = useState(winner);

  useEffect(() => {
    if (gameStarted) {
      // console.log('opponent whom', opponent);
      const gameState = getGameState(board, turnCount, lastKingMadeAt, lastCaptureMadeAt, opponent);

      if (opponent === PLAYER_2) {
        setOpponentName('Player 2');
      }

      if (opponent === COMPUTER) {
        setOpponentName('Computer');
      }

      setCellCountOne(gameState.playerOneCount);

      if (opponent === PLAYER_2) {
        setCellCountTwo(gameState.playerTwoCount);
      }

      if (opponent === COMPUTER) {
        setCellCountTwo(gameState.computerCount);
      }
    }

    if (whoseTurn === PLAYER_1) {
      setPlayerName('Player 1');
    }

    if (whoseTurn === PLAYER_2) {
      setPlayerName('Player 2');
    }

    if (whoseTurn === COMPUTER) {
      setPlayerName('Computer');
    }
  }, [board]);

  return (
    <div className="game_state--container">
      <div className="info--box">
        <div className="info--1">Whose Turn</div>
        <div className="info--2">{playerName}</div>
      </div>
      <div className="info--box">
        <div className="info--1">Turn Count</div>
        <div className="info--2">{turnCount + 1}</div>
      </div>
      <div className="info--box">
        <div className="info--1">Player 1 Cells</div>
        <div className="info--2">{cellCountOne}</div>
      </div>

      <div className="info--box">
        <div className="info--1">{opponentName} Cells </div>
        <div className="info--2">{cellCountTwo}</div>
      </div>

      {gameFinished && (
        <div className="info--box">
          <div className="info--1">Winner is </div>
          <div className="info--2">{winner}</div>
        </div>
      )}
    </div>
  );
};

export default GameState;
