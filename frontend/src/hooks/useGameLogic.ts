import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, Position, GameMode } from '@/types/game';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const getInitialState = (): GameState => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  food: { x: 15, y: 10 },
  direction: 'RIGHT',
  score: 0,
  isGameOver: false,
  isPaused: true,
  speed: INITIAL_SPEED,
});

const generateFood = (snake: Position[]): Position => {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
};

export const useGameLogic = (mode: GameMode) => {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<number | null>(null);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.isGameOver || prevState.isPaused) return prevState;

      const head = prevState.snake[0];
      let newHead: Position;

      switch (directionRef.current) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Handle boundaries based on mode
      if (mode === 'passthrough') {
        newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
        newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
      } else {
        // Walls mode - check for collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          return { ...prevState, isGameOver: true };
        }
      }

      // Check self-collision
      if (prevState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        return { ...prevState, isGameOver: true };
      }

      const newSnake = [newHead, ...prevState.snake];
      let newFood = prevState.food;
      let newScore = prevState.score;
      let newSpeed = prevState.speed;

      // Check if food eaten
      if (newHead.x === prevState.food.x && newHead.y === prevState.food.y) {
        newFood = generateFood(newSnake);
        newScore += 10;
        // Increase speed every 50 points
        if (newScore % 50 === 0 && newSpeed > 50) {
          newSpeed -= 10;
        }
      } else {
        newSnake.pop();
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        score: newScore,
        direction: directionRef.current,
        speed: newSpeed,
      };
    });
  }, [mode]);

  const changeDirection = useCallback((newDirection: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== directionRef.current) {
      directionRef.current = newDirection;
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resetGame = useCallback(() => {
    directionRef.current = 'RIGHT';
    setGameState(getInitialState());
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = window.setInterval(moveSnake, gameState.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPaused, gameState.isGameOver, gameState.speed, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.isGameOver) {
            resetGame();
          } else if (gameState.isPaused) {
            startGame();
          } else {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, gameState.isGameOver, gameState.isPaused, pauseGame, resetGame, startGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
  };
};
