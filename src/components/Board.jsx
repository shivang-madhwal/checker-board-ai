import React from 'react';
import Cell from './Cell';

const Row = ({ rowData, xPosition }) => {
  return (
    <div className="game__row">
      {rowData.map((item, index) => {
        return <Cell data={item} key={index} yPosition={index} xPosition={xPosition} />;
      })}
    </div>
  );
};

const Board = ({ boardData }) => {
  if (boardData.length === 0) {
    return <div />;
  }

  return (
    <div className="game__container">
      {boardData.map((x, index) => {
        return <Row rowData={x} key={index} xPosition={index} />;
      })}
    </div>
  );
};

export default Board;
