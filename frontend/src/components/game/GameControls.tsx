import { Button } from '@/components/ui/button';
import { GameMode } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';

type GameControlsProps = {
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export const GameControls = ({
  isPaused,
  isGameOver,
  score,
  mode,
  onModeChange,
  onStart,
  onPause,
  onReset,
}: GameControlsProps) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Score display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">SCORE</p>
        <p className="text-4xl font-arcade neon-glow text-primary">{score}</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'passthrough' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('passthrough')}
          className="font-arcade text-xs"
        >
          PASS-THROUGH
        </Button>
        <Button
          variant={mode === 'walls' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => onModeChange('walls')}
          className="font-arcade text-xs"
        >
          WALLS
        </Button>
      </div>

      {/* Game controls */}
      <div className="flex gap-2">
        {isGameOver ? (
          <Button onClick={onReset} className="font-arcade gap-2">
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </Button>
        ) : isPaused ? (
          <Button onClick={onStart} className="font-arcade gap-2">
            <Play className="w-4 h-4" />
            START
          </Button>
        ) : (
          <Button onClick={onPause} variant="secondary" className="font-arcade gap-2">
            <Pause className="w-4 h-4" />
            PAUSE
          </Button>
        )}
        {!isGameOver && (
          <Button onClick={onReset} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-muted-foreground mt-4">
        <p>Use WASD or Arrow Keys to move</p>
        <p>Press SPACE to pause/resume</p>
      </div>
    </div>
  );
};
