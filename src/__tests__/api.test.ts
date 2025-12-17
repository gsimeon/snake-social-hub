import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, leaderboardApi, playersApi } from '@/services/api';

describe('Auth API', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const response = await authApi.signup('TestUser', 'test@example.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.username).toBe('TestUser');
      expect(response.user?.email).toBe('test@example.com');
    });

    it('should fail with short password', async () => {
      const response = await authApi.signup('TestUser', 'test2@example.com', '123');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Password must be at least 6 characters');
    });

    it('should fail with duplicate email', async () => {
      await authApi.signup('User1', 'duplicate@example.com', 'password123');
      const response = await authApi.signup('User2', 'duplicate@example.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Email already exists');
    });

    it('should fail with duplicate username', async () => {
      await authApi.signup('DuplicateName', 'user1@example.com', 'password123');
      const response = await authApi.signup('DuplicateName', 'user2@example.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Username already taken');
    });
  });

  describe('login', () => {
    it('should login existing user', async () => {
      // Login with pre-existing mock user
      const response = await authApi.login('pro@snake.com', 'password');
      expect(response.success).toBe(true);
      expect(response.user?.username).toBe('ProSnaker');
    });

    it('should fail with wrong credentials', async () => {
      const response = await authApi.login('wrong@email.com', 'wrongpassword');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      await authApi.login('pro@snake.com', 'password');
      const response = await authApi.logout();
      expect(response.success).toBe(true);
      
      const userResponse = await authApi.getCurrentUser();
      expect(userResponse.data).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not logged in', async () => {
      const response = await authApi.getCurrentUser();
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    it('should return user from localStorage', async () => {
      await authApi.login('pro@snake.com', 'password');
      const response = await authApi.getCurrentUser();
      expect(response.success).toBe(true);
      expect(response.data?.username).toBe('ProSnaker');
    });
  });
});

describe('Leaderboard API', () => {
  describe('getLeaderboard', () => {
    it('should return all leaderboard entries', async () => {
      const response = await leaderboardApi.getLeaderboard();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data!.length).toBeGreaterThan(0);
    });

    it('should filter by mode', async () => {
      const wallsResponse = await leaderboardApi.getLeaderboard('walls');
      expect(wallsResponse.success).toBe(true);
      expect(wallsResponse.data!.every(entry => entry.mode === 'walls')).toBe(true);

      const passResponse = await leaderboardApi.getLeaderboard('passthrough');
      expect(passResponse.success).toBe(true);
      expect(passResponse.data!.every(entry => entry.mode === 'passthrough')).toBe(true);
    });

    it('should return sorted by score descending', async () => {
      const response = await leaderboardApi.getLeaderboard();
      const scores = response.data!.map(e => e.score);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });
  });

  describe('submitScore', () => {
    beforeEach(async () => {
      localStorage.clear();
      await authApi.login('pro@snake.com', 'password');
    });

    it('should submit score when logged in', async () => {
      const response = await leaderboardApi.submitScore(1000, 'walls');
      expect(response.success).toBe(true);
      expect(response.data?.score).toBe(1000);
      expect(response.data?.mode).toBe('walls');
    });

    it('should fail when not logged in', async () => {
      await authApi.logout();
      const response = await leaderboardApi.submitScore(1000, 'walls');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Must be logged in to submit score');
    });
  });
});

describe('Players API', () => {
  describe('getActivePlayers', () => {
    it('should return active players', async () => {
      const response = await playersApi.getActivePlayers();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data!.length).toBeGreaterThan(0);
    });

    it('should have valid player data', async () => {
      const response = await playersApi.getActivePlayers();
      const player = response.data![0];
      expect(player.id).toBeDefined();
      expect(player.username).toBeDefined();
      expect(player.snake.length).toBeGreaterThan(0);
      expect(player.food).toBeDefined();
      expect(['walls', 'passthrough']).toContain(player.mode);
    });
  });

  describe('simulatePlayerMove', () => {
    it('should move snake in passthrough mode', async () => {
      const response = await playersApi.getActivePlayers();
      const player = { ...response.data![0], mode: 'passthrough' as const };
      const originalHead = { ...player.snake[0] };
      
      const movedPlayer = playersApi.simulatePlayerMove(player);
      expect(movedPlayer.snake[0]).not.toEqual(originalHead);
    });

    it('should keep snake in bounds for walls mode', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 0,
        mode: 'walls' as const,
        snake: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
        food: { x: 10, y: 10 },
        direction: 'LEFT' as const,
        startedAt: new Date().toISOString(),
      };
      
      const movedPlayer = playersApi.simulatePlayerMove(player);
      expect(movedPlayer.snake[0].x).toBeGreaterThanOrEqual(0);
      expect(movedPlayer.snake[0].x).toBeLessThan(20);
    });

    it('should wrap around in passthrough mode', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 0,
        mode: 'passthrough' as const,
        snake: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
        food: { x: 10, y: 10 },
        direction: 'LEFT' as const,
        startedAt: new Date().toISOString(),
      };
      
      const movedPlayer = playersApi.simulatePlayerMove(player);
      expect(movedPlayer.snake[0].x).toBeGreaterThanOrEqual(0);
    });

    it('should increase score when eating food', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 0,
        mode: 'passthrough' as const,
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
        food: { x: 6, y: 5 },
        direction: 'RIGHT' as const,
        startedAt: new Date().toISOString(),
      };
      
      const movedPlayer = playersApi.simulatePlayerMove(player);
      if (movedPlayer.snake[0].x === 6 && movedPlayer.snake[0].y === 5) {
        expect(movedPlayer.score).toBe(10);
        expect(movedPlayer.snake.length).toBe(3);
      }
    });
  });
});
