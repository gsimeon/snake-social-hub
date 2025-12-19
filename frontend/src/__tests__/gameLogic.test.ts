import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the game logic utilities
const GRID_SIZE = 20;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

// Pure function tests for game mechanics
describe('Game Logic - Pure Functions', () => {
  describe('moveSnake', () => {
    const moveHead = (head: Position, direction: Direction): Position => {
      switch (direction) {
        case 'UP':
          return { x: head.x, y: head.y - 1 };
        case 'DOWN':
          return { x: head.x, y: head.y + 1 };
        case 'LEFT':
          return { x: head.x - 1, y: head.y };
        case 'RIGHT':
          return { x: head.x + 1, y: head.y };
      }
    };

    it('should move head up correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = moveHead(head, 'UP');
      expect(newHead).toEqual({ x: 10, y: 9 });
    });

    it('should move head down correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = moveHead(head, 'DOWN');
      expect(newHead).toEqual({ x: 10, y: 11 });
    });

    it('should move head left correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = moveHead(head, 'LEFT');
      expect(newHead).toEqual({ x: 9, y: 10 });
    });

    it('should move head right correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = moveHead(head, 'RIGHT');
      expect(newHead).toEqual({ x: 11, y: 10 });
    });
  });

  describe('boundary handling', () => {
    const handlePassthrough = (pos: Position): Position => ({
      x: (pos.x + GRID_SIZE) % GRID_SIZE,
      y: (pos.y + GRID_SIZE) % GRID_SIZE,
    });

    const checkWallCollision = (pos: Position): boolean => {
      return pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE;
    };

    it('should wrap around left edge in passthrough mode', () => {
      const pos = { x: -1, y: 10 };
      const wrapped = handlePassthrough(pos);
      expect(wrapped.x).toBe(19);
    });

    it('should wrap around right edge in passthrough mode', () => {
      const pos = { x: 20, y: 10 };
      const wrapped = handlePassthrough(pos);
      expect(wrapped.x).toBe(0);
    });

    it('should wrap around top edge in passthrough mode', () => {
      const pos = { x: 10, y: -1 };
      const wrapped = handlePassthrough(pos);
      expect(wrapped.y).toBe(19);
    });

    it('should wrap around bottom edge in passthrough mode', () => {
      const pos = { x: 10, y: 20 };
      const wrapped = handlePassthrough(pos);
      expect(wrapped.y).toBe(0);
    });

    it('should detect left wall collision', () => {
      expect(checkWallCollision({ x: -1, y: 10 })).toBe(true);
    });

    it('should detect right wall collision', () => {
      expect(checkWallCollision({ x: 20, y: 10 })).toBe(true);
    });

    it('should detect top wall collision', () => {
      expect(checkWallCollision({ x: 10, y: -1 })).toBe(true);
    });

    it('should detect bottom wall collision', () => {
      expect(checkWallCollision({ x: 10, y: 20 })).toBe(true);
    });

    it('should not detect collision for valid position', () => {
      expect(checkWallCollision({ x: 10, y: 10 })).toBe(false);
    });
  });

  describe('self collision detection', () => {
    const checkSelfCollision = (head: Position, body: Position[]): boolean => {
      return body.some(segment => segment.x === head.x && segment.y === head.y);
    };

    it('should detect collision with body', () => {
      const head = { x: 5, y: 5 };
      const body = [
        { x: 4, y: 5 },
        { x: 5, y: 5 }, // Collision
        { x: 6, y: 5 },
      ];
      expect(checkSelfCollision(head, body)).toBe(true);
    });

    it('should not detect collision when head is clear', () => {
      const head = { x: 10, y: 10 };
      const body = [
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 },
      ];
      expect(checkSelfCollision(head, body)).toBe(false);
    });
  });

  describe('food collision detection', () => {
    const checkFoodCollision = (head: Position, food: Position): boolean => {
      return head.x === food.x && head.y === food.y;
    };

    it('should detect food collision', () => {
      const head = { x: 5, y: 5 };
      const food = { x: 5, y: 5 };
      expect(checkFoodCollision(head, food)).toBe(true);
    });

    it('should not detect collision when food is elsewhere', () => {
      const head = { x: 5, y: 5 };
      const food = { x: 10, y: 10 };
      expect(checkFoodCollision(head, food)).toBe(false);
    });
  });

  describe('direction change validation', () => {
    const isValidDirectionChange = (current: Direction, next: Direction): boolean => {
      const opposites: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };
      return opposites[next] !== current;
    };

    it('should allow perpendicular direction changes', () => {
      expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
    });

    it('should prevent 180 degree turns', () => {
      expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
      expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
      expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
      expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
    });

    it('should allow same direction', () => {
      expect(isValidDirectionChange('UP', 'UP')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
    });
  });

  describe('food generation', () => {
    const generateFood = (snake: Position[]): Position => {
      const GRID_SIZE = 20;
      let newFood: Position;
      let attempts = 0;
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
        attempts++;
      } while (
        snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) &&
        attempts < 1000
      );
      return newFood;
    };

    it('should generate food within grid bounds', () => {
      const snake = [{ x: 10, y: 10 }];
      const food = generateFood(snake);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(GRID_SIZE);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(GRID_SIZE);
    });

    it('should not generate food on snake body', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      
      // Run multiple times to test randomness
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
        expect(onSnake).toBe(false);
      }
    });
  });

  describe('score calculation', () => {
    const calculateSpeedIncrease = (score: number, currentSpeed: number): number => {
      if (score % 50 === 0 && currentSpeed > 50) {
        return currentSpeed - 10;
      }
      return currentSpeed;
    };

    it('should decrease speed at score milestones', () => {
      expect(calculateSpeedIncrease(50, 150)).toBe(140);
      expect(calculateSpeedIncrease(100, 140)).toBe(130);
    });

    it('should not decrease speed below minimum', () => {
      expect(calculateSpeedIncrease(50, 50)).toBe(50);
      expect(calculateSpeedIncrease(50, 40)).toBe(40);
    });

    it('should not change speed at non-milestone scores', () => {
      expect(calculateSpeedIncrease(30, 150)).toBe(150);
      expect(calculateSpeedIncrease(75, 140)).toBe(140);
    });
  });
});

describe('Snake movement integration', () => {
  type GameState = {
    snake: Position[];
    food: Position;
    direction: Direction;
    score: number;
    isGameOver: boolean;
  };

  const moveSnake = (state: GameState, mode: 'passthrough' | 'walls'): GameState => {
    const head = state.snake[0];
    let newHead: Position;

    switch (state.direction) {
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

    // Handle boundaries
    if (mode === 'passthrough') {
      newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
      newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
    } else {
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        return { ...state, isGameOver: true };
      }
    }

    // Check self-collision
    if (state.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      return { ...state, isGameOver: true };
    }

    const newSnake = [newHead, ...state.snake];
    let newScore = state.score;
    let newFood = state.food;

    if (newHead.x === state.food.x && newHead.y === state.food.y) {
      newScore += 10;
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } else {
      newSnake.pop();
    }

    return {
      ...state,
      snake: newSnake,
      score: newScore,
      food: newFood,
    };
  };

  it('should move snake and maintain length when not eating', () => {
    const state: GameState = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      food: { x: 15, y: 15 },
      direction: 'RIGHT',
      score: 0,
      isGameOver: false,
    };

    const newState = moveSnake(state, 'passthrough');
    expect(newState.snake.length).toBe(3);
    expect(newState.snake[0]).toEqual({ x: 11, y: 10 });
    expect(newState.score).toBe(0);
  });

  it('should grow snake when eating food', () => {
    const state: GameState = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      food: { x: 11, y: 10 },
      direction: 'RIGHT',
      score: 0,
      isGameOver: false,
    };

    const newState = moveSnake(state, 'passthrough');
    expect(newState.snake.length).toBe(4);
    expect(newState.score).toBe(10);
  });

  it('should end game on wall collision in walls mode', () => {
    const state: GameState = {
      snake: [{ x: 0, y: 10 }, { x: 1, y: 10 }],
      food: { x: 15, y: 15 },
      direction: 'LEFT',
      score: 0,
      isGameOver: false,
    };

    const newState = moveSnake(state, 'walls');
    expect(newState.isGameOver).toBe(true);
  });

  it('should wrap around in passthrough mode', () => {
    const state: GameState = {
      snake: [{ x: 0, y: 10 }, { x: 1, y: 10 }],
      food: { x: 15, y: 15 },
      direction: 'LEFT',
      score: 0,
      isGameOver: false,
    };

    const newState = moveSnake(state, 'passthrough');
    expect(newState.isGameOver).toBe(false);
    expect(newState.snake[0].x).toBe(19);
  });
});
