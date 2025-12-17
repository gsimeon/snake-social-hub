export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'passthrough' | 'walls';

export type Position = {
  x: number;
  y: number;
};

export type GameState = {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  speed: number;
};

export type User = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  date: string;
};

export type ActivePlayer = {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  snake: Position[];
  food: Position;
  direction: Direction;
  startedAt: string;
};

export type AuthResponse = {
  success: boolean;
  user?: User;
  error?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
