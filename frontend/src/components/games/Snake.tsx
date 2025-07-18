
import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const Snake: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [speed, setSpeed] = useState<number | null>(200);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const createFood = useCallback((currentSnake: { x: number, y: number }[]) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, []);
  
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    createFood(INITIAL_SNAKE);
    setDirection('RIGHT');
    setSpeed(200);
    setGameOver(false);
    setScore(0);
  }, [createFood]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
      case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
      case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
      case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
    }
  }, [direction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    if (gameOver) {
      setSpeed(null);
      return;
    }
    
    setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            setGameOver(true);
            return prevSnake;
        }

        // Self collision
        for (let i = 1; i < newSnake.length; i++) {
            if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
                setGameOver(true);
                return prevSnake;
            }
        }
        
        newSnake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            setScore(s => s + 1);
            setSpeed(s => Math.max(50, (s || 200) * 0.95));
            createFood(newSnake);
        } else {
            newSnake.pop();
        }
        
        return newSnake;
    });
  }, [direction, food, gameOver, createFood]);


  useEffect(() => {
    if (speed !== null) {
      const gameInterval = setInterval(moveSnake, speed);
      return () => clearInterval(gameInterval);
    }
  }, [speed, moveSnake]);

  // Initialize food on first render
  useEffect(() => {
    createFood(INITIAL_SNAKE);
  }, [createFood]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-2 text-cyan-400">Snake</h2>
      <p className="text-lg mb-4 text-slate-300">Score: {score}</p>
      <div
        className="grid bg-slate-700 border-2 border-slate-600 relative"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: 'calc(20 * 1rem)', height: 'calc(20 * 1rem)',
        }}
      >
        {gameOver && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-70 z-10">
            <p className="text-3xl font-bold text-red-500">Game Over</p>
            <button onClick={resetGame} className="mt-4 bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded">Play Again</button>
          </div>
        )}
        {snake.map((segment, index) => (
          <div key={index} className="bg-green-500" style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}></div>
        ))}
        <div className="bg-red-500 rounded-full" style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }}></div>
      </div>
      <p className="mt-4 text-slate-400">Use arrow keys to move.</p>
    </div>
  );
};

export default Snake;
