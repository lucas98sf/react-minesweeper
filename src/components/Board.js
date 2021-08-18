import Square from './Square'
import { MAX_BOMBS, MAX_HEIGHT, MAX_WIDTH } from '../config/constants'

let board = [];
let bombs = generateBombCoords();
for (let i = 0; i < MAX_HEIGHT - 1; i++) {
  let squares = [];
  for (let j = 0; j < MAX_WIDTH - 1; j++) {
    const value = String(i) + String(j);
    squares.push(<Square value={value} bomb={bombs.some(bomb => (bomb.x === i && bomb.y === j))} />)
  }
  const div = <div className="board-row">{squares}</div>
  board.push(div)
}

function Board(props) {
  return (
    <div className="board">
      {board}
    </div>
  );
}

function generateBombCoords() {
  const coords = [];
  const randomCoord = (MAX) => (Math.random() * (MAX + 1)) << 0

  for (let i = 0; i < MAX_BOMBS; i++) {
    const newCoord = { x: randomCoord(MAX_HEIGHT), y: randomCoord(MAX_WIDTH) }
    const notInCoords = !coords.some(coord => coord === newCoord)
    notInCoords ? coords.push(newCoord) : i--;
  }
  console.log(coords)
  return coords;
}

export default Board;
