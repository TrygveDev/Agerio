import './Game.css';

function Game(props) {

  console.log(props.username)
  return (
    <div>
      <button onClick={() => props.setPage("Menu")}>MENU</button>
    </div>
  );
}

export default Game;
