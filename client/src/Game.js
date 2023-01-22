import { useEffect, useRef, useState, useCallback } from 'react';
import style from './game.module.css';
import Food from './classes/Food';
import Character from './classes/Character';
import Enemy from './classes/Enemy';

function Game(props) {
  const [socket, setSocket] = useState(null);
  const [foodList, setFoodList] = useState([]);
  const [devStats, setDevStats] = useState("This is the game page. Press escape to return to the menu.")
  const canvasRef = useRef(null);


  // Return to menu on escape key press
  useEffect(() => {
    function handleKeyPress(e) {
      if (e.key === 'Escape') {
        props.setPage("Menu")
      }
    }
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  });

  // Get the canvas element
  useEffect(() => {
    const camera = canvasRef.current;
    camera.width = window.innerWidth;
    camera.height = window.innerHeight;

    const ctx = camera.getContext('2d');
    ctx.beginPath();
    ctx.rect(0, 0, 5000, 5000);
    ctx.fillStyle = '#fff';
    ctx.fill();
  })


  // Server connection
  useEffect(() => {
    let ws;
    if (!socket) {
      // const ws = new WebSocket('wss://gi.binders.net:25594');
      ws = new WebSocket('ws://localhost:8080');
      ws.onopen = () => {
        console.log('Connection established');
      };
      setSocket(ws);
    } else {
      ws = socket;
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'playerData') {
        // Update the player data with the new data
      }
      if (data.type === 'foodData') {
        // Update the food data with the new data
        const tempFoodList = []
        data.foodList.forEach(food => {
          tempFoodList.push(new Food(canvasRef.current, food.x, food.y, food.id));
        });
        setFoodList(tempFoodList);
      }
      if (data.type === 'playerDeath') {
        // Respawn the player
      }
      if (data.type === 'unautorized') {
        window.close();
      }
    };

    ws.onclose = () => {
      console.log('Connection disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className={style.container}>
      <div className={style.devStats} onClick={() => socket.close()}>{devStats}</div>
      <canvas ref={canvasRef}></canvas>
    </div >
  );
}


export default Game;
