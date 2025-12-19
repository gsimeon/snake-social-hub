import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, leaderboardApi, playersApi } from '@/services/api';

describe('Auth API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should call fetch with correct arguments', async () => {
      const mockResponse = { success: true, user: { id: '123', username: 'TestUser', email: 'test@example.com' } };
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const response = await authApi.signup('TestUser', 'test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/auth/signup', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'TestUser', email: 'test@example.com', password: 'password123' }),
      }));
      expect(response).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should call fetch with correct arguments and valid credentials', async () => {
      const mockResponse = { success: true, user: { id: '123', username: 'ProSnaker' } };
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const response = await authApi.login('pro@snake.com', 'password');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'pro@snake.com', password: 'password' }),
      }));
      expect(response).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      await authApi.logout();
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/auth/logout', expect.anything());
    });
  });

  describe('getCurrentUser', () => {
    it('should return null if no token in localStorage', async () => {
      const response = await authApi.getCurrentUser();
      expect(response.data).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch user if token exists', async () => {
      localStorage.setItem('snake_user', JSON.stringify({ id: '123', username: 'Test' }));
      const mockResponse = { success: true, data: { username: 'Test' } };
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      });

      const response = await authApi.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/auth/me', expect.any(Object));
      expect(response).toEqual(mockResponse);
    });
  });
});

describe('Leaderboard API', () => {
  describe('getLeaderboard', () => {
    it('should fetch leaderboard', async () => {
      await leaderboardApi.getLeaderboard();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('http://localhost:8000/leaderboard/'));
    });

    it('should include mode parameter', async () => {
      await leaderboardApi.getLeaderboard('walls');
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('mode=walls'));
    });
  });

  describe('submitScore', () => {
    it('should post score', async () => {
      await leaderboardApi.submitScore(1000, 'walls');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/leaderboard/', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ score: 1000, mode: 'walls' }),
      }));
    });
  });
});

describe('Players API', () => {
  describe('getActivePlayers', () => {
    it('should fetch active players', async () => {
      await playersApi.getActivePlayers();
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/players/');
    });
  });

  describe('simulatePlayerMove', () => {
    it('should still working locally (pure function)', () => {
      // This test remains valid as the function is client-side logic
      const player: any = {
        id: 'test',
        snake: [{ x: 5, y: 5 }],
        food: { x: 10, y: 10 },
        direction: 'UP',
        score: 0,
        mode: 'walls'
      };
      const moved = playersApi.simulatePlayerMove(player);
      expect(moved.snake[0]).not.toEqual(player.snake[0]);
    });
  });
});
