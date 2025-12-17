import { useState, useEffect } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { GameOverlay } from '@/components/game/GameOverlay';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import { leaderboardApi } from '@/services/api';
import { GameMode } from '@/types/game';
import { toast } from 'sonner';

const Index = () => {
  const [mode, setMode] = useState<GameMode>('passthrough');
  const { gameState, startGame, pauseGame, resetGame } = useGameLogic(mode);
  const { isAuthenticated } = useAuth();
  const [lastSubmittedScore, setLastSubmittedScore] = useState<number | null>(null);

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    resetGame();
  };

  // Submit score when game ends
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0 && gameState.score !== lastSubmittedScore) {
      setLastSubmittedScore(gameState.score);
      
      if (isAuthenticated) {
        leaderboardApi.submitScore(gameState.score, mode).then(response => {
          if (response.success) {
            toast.success(`Score ${gameState.score} submitted to leaderboard!`);
          }
        });
      } else {
        toast.info('Login to save your score to the leaderboard!');
      }
    }
  }, [gameState.isGameOver, gameState.score, isAuthenticated, mode, lastSubmittedScore]);

  // Reset lastSubmittedScore when starting a new game
  useEffect(() => {
    if (!gameState.isGameOver && gameState.score === 0) {
      setLastSubmittedScore(null);
    }
  }, [gameState.isGameOver, gameState.score]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Game Board */}
        <div className="relative">
          <GameBoard 
            snake={gameState.snake} 
            food={gameState.food} 
            mode={mode}
          />
          <GameOverlay 
            show={gameState.isPaused || gameState.isGameOver}
            type={gameState.isGameOver ? 'gameover' : 'paused'}
            score={gameState.isGameOver ? gameState.score : undefined}
          />
        </div>

        {/* Controls */}
        <GameControls
          isPaused={gameState.isPaused}
          isGameOver={gameState.isGameOver}
          score={gameState.score}
          mode={mode}
          onModeChange={handleModeChange}
          onStart={startGame}
          onPause={pauseGame}
          onReset={resetGame}
        />
      </div>
    </div>
  );
};

export default Index;
