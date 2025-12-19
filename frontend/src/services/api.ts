import { User, LeaderboardEntry, ActivePlayer, AuthResponse, ApiResponse, GameMode, Position } from '@/types/game';

const API_URL = '/api';

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // In our mock backend, token IS the user ID
  } else {
    // Try to get from localStorage if not provided explicitly
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      const user = JSON.parse(stored);
      headers['Authorization'] = `Bearer ${user.id}`;
    }
  }
  return headers;
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem('snake_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  signup: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem('snake_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: getHeaders() });
    } catch (e) {
      // ignore network error on logout
    }
    localStorage.removeItem('snake_user');
    return { success: true };
  },

  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    const stored = localStorage.getItem('snake_user');
    if (!stored) return { success: true, data: null };

    try {
      // Verify with backend
      const user = JSON.parse(stored);
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(user.id)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: true, data: null };
    }
  },
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: async (mode?: GameMode, username?: string): Promise<ApiResponse<LeaderboardEntry[]>> => {
    try {
      const url = new URL(`${API_URL}/leaderboard/`, window.location.origin);
      if (mode) url.searchParams.append('mode', mode);
      if (username) url.searchParams.append('username', username);

      const response = await fetch(url.toString());
      const data = await response.json();
      console.log('Leaderboard data:', data);
      return data;
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      return { success: false, error: 'Failed to fetch leaderboard' };
    }
  },

  submitScore: async (score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> => {
    try {
      const response = await fetch(`${API_URL}/leaderboard/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ score, mode }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to submit score' };
    }
  },
};

// Active Players API (for spectating)
export const playersApi = {
  getActivePlayers: async (): Promise<ApiResponse<ActivePlayer[]>> => {
    try {
      const response = await fetch(`${API_URL}/players/`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to fetch active players' };
    }
  },

  getPlayerState: async (playerId: string): Promise<ApiResponse<ActivePlayer | null>> => {
    try {
      const response = await fetch(`${API_URL}/players/${playerId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to fetch player state' };
    }
  },

  // Simulate player movement locally for smoothness if needed, 
  // or just use this helper for client-side interpolation.
  // We'll keep the logic here for smooth spectating even if data comes from API.
  simulatePlayerMove: (player: ActivePlayer): ActivePlayer => {
    // NOTE: We keep this client-side pure function for animation/interpolation logic
    // as the original was pure logic.
    const directions: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const head = player.snake[0];
    let newHead: Position;

    // In a real app, this "simulation" would just process the NEXT state based on 
    // server updates, but for now we keep the random walk logic for the demo visual.
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

    // Check if food eaten (client side guess)
    let newFood = player.food;
    let newScore = player.score;
    if (newHead.x === player.food.x && newHead.y === player.food.y) {
      newSnake.push(player.snake[player.snake.length - 1]);
      // Client cannot really generate random food sync with server
      // newFood = generateRandomFood(); 
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
