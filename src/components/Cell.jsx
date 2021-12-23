import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { PLAYER_1, PLAYER_2, COMPUTER, EMPTY } from '../constants';
import { handleClick } from '../helpers';

import {
  changeTurnCountByAmount,
  changeWhoseTurn,
  selectBoard,
  selectOpponent,
  selectTurnCount,
  selectWhoseTurn,
  setBoard,
  setCaptureMadeAt,
  setKingMadeAt,
} from '../features/game/gameSlice';
import { getCheckerPieceClass } from '../helpers';

const Cell = ({ data, xPosition, yPosition }) => {
  const checkerClassNames = useMemo(() => getCheckerPieceClass(data), [data]);

  const dispatch = useDispatch();
  const board = useSelector(selectBoard);
  const whoseTurn = useSelector(selectWhoseTurn);
  const turnCount = useSelector(selectTurnCount);
  const opponent = useSelector(selectOpponent);

  const handlePlayerClick = (e) => {
    e.stopPropagation();

    const result = handleClick(xPosition, yPosition, board, whoseTurn);

    if (!result.isSuccessful) {
      return;
    }

    dispatch(setBoard(result.boardData));

    if (result.wasExecuted) {
      if (result.wasKingMade) {
        dispatch(setKingMadeAt(turnCount));
      }

      if (result.wasCaptureMade) {
        dispatch(setCaptureMadeAt(turnCount));
      }

      if (whoseTurn == PLAYER_1) {
        dispatch(changeWhoseTurn(opponent));
      } else if (whoseTurn == opponent) {
        dispatch(changeWhoseTurn(PLAYER_1));
      }

      dispatch(changeTurnCountByAmount(1));
    }
  };

  return (
    <div
      className={`game__cell ${(xPosition + yPosition) % 2 == 0 ? 'cell__dark' : 'cell__grey'}`}
      onClick={handlePlayerClick}
    >
      <div className={checkerClassNames} />
    </div>
  );
};

export default Cell;
