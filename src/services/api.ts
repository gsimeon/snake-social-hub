import { User, LeaderboardEntry, ActivePlayer, AuthResponse, ApiResponse, GameMode, Position } from '@/types/game';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (simulating backend)
let currentUser: User | null = null;
let users: User[] = [
  { id: '1', username: 'ProSnaker', email: 'pro@snake.com', createdAt: '2024-01-01' },
  { id: '2', username: 'RetroGamer', email: 'retro@game.com', createdAt: '2024-01-15' },
  { id: '3', username: 'NeonMaster', email: 'neon@master.com', createdAt: '2024-02-01' },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'ProSnaker', score: 2500, mode: 'walls', date: '2024-12-15' },
  { id: '2', username: 'RetroGamer', score: 2100, mode: 'walls', date: '2024-12-14' },
  { id: '3', username: 'NeonMaster', score: 1800, mode: 'passthrough', date: '2024-12-16' },
  { id: '4', username: 'PixelKing', score: 1650, mode: 'walls', date: '2024-12-13' },
  { id: '5', username: 'ArcadeQueen', score: 1500, mode: 'passthrough', date: '2024-12-12' },
  { id: '6', username: 'SnakeByte', score: 1400, mode: 'walls', date: '2024-12-11' },
  { id: '7', username: 'GridRunner', score: 1250, mode: 'passthrough', date: '2024-12-10' },
  { id: '8', username: 'VectorViper', score: 1100, mode: 'walls', date: '2024-12-09' },
  { id: '9', username: 'NightCrawler', score: 950, mode: 'passthrough', date: '2024-12-08' },
  { id: '10', username: 'BitSlither', score: 800, mode: 'walls', date: '2024-12-07' },
];

// Generate a random snake position for spectating
const generateRandomSnake = (): Position[] => {
  const startX = Math.floor(Math.random() * 15) + 5;
  const startY = Math.floor(Math.random() * 15) + 5;
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
    { x: startX - 3, y: startY },
  ];
};

const generateRandomFood = (): Position => ({
  x: Math.floor(Math.random() * 20),
  y: Math.floor(Math.random() * 20),
});

const mockActivePlayers: ActivePlayer[] = [
  {
    id: 'ap1',
    username: 'LivePlayer1',
    score: 450,
    mode: 'walls',
    snake: generateRandomSnake(),
    food: generateRandomFood(),
    direction: 'RIGHT',
    startedAt: new Date().toISOString(),
  },
  {
    id: 'ap2',
    username: 'StreamSnake',
    score: 320,
    mode: 'passthrough',
    snake: generateRandomSnake(),
    food: generateRandomFood(),
    direction: 'DOWN',
    startedAt: new Date().toISOString(),
  },
  {
    id: 'ap3',
    username: 'WatchMe',
    score: 680,
    mode: 'walls',
    snake: generateRandomSnake(),
    food: generateRandomFood(),
    direction: 'UP',
    startedAt: new Date().toISOString(),
  },
];

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(500);
    
    const user = users.find(u => u.email === email);
    if (user && password.length >= 6) {
      currentUser = user;
      localStorage.setItem('snake_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  signup: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    await delay(500);
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser: User = {
      id: String(users.length + 1),
      username,
      email,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    currentUser = newUser;
    localStorage.setItem('snake_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  logout: async (): Promise<ApiResponse<null>> => {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_user');
    return { success: true };
  },

  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    await delay(100);
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return { success: true, data: currentUser };
    }
    return { success: true, data: null };
  },
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: async (mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> => {
    await delay(300);
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    return { success: true, data: entries.sort((a, b) => b.score - a.score) };
  },

  submitScore: async (score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> => {
    await delay(300);
    if (!currentUser) {
      return { success: false, error: 'Must be logged in to submit score' };
    }
    const entry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      username: currentUser.username,
      score,
      mode,
      date: new Date().toISOString().split('T')[0],
    };
    mockLeaderboard.push(entry);
    return { success: true, data: entry };
  },
};

// Active Players API (for spectating)
export const playersApi = {
  getActivePlayers: async (): Promise<ApiResponse<ActivePlayer[]>> => {
    await delay(200);
    return { success: true, data: mockActivePlayers };
  },

  getPlayerState: async (playerId: string): Promise<ApiResponse<ActivePlayer | null>> => {
    await delay(100);
    const player = mockActivePlayers.find(p => p.id === playerId);
    return { success: true, data: player || null };
  },

  // Simulate player movement for spectating
  simulatePlayerMove: (player: ActivePlayer): ActivePlayer => {
    const directions: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const head = player.snake[0];
    let newHead: Position;
    
    // Randomly change direction sometimes
    const newDirection = Math.random() > 0.8 
      ? directions[Math.floor(Math.random() * 4)] 
      : player.direction;

    switch (newDirection) {
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

    // Handle walls/passthrough
    if (player.mode === 'passthrough') {
      newHead.x = (newHead.x + 20) % 20;
      newHead.y = (newHead.y + 20) % 20;
    } else {
      newHead.x = Math.max(0, Math.min(19, newHead.x));
      newHead.y = Math.max(0, Math.min(19, newHead.y));
    }

    const newSnake = [newHead, ...player.snake.slice(0, -1)];
    
    // Check if food eaten
    let newFood = player.food;
    let newScore = player.score;
    if (newHead.x === player.food.x && newHead.y === player.food.y) {
      newSnake.push(player.snake[player.snake.length - 1]);
      newFood = generateRandomFood();
      newScore += 10;
    }

    return {
      ...player,
      snake: newSnake,
      food: newFood,
      direction: newDirection,
      score: newScore,
    };
  },
};
