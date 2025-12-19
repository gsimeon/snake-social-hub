import { cn } from '@/lib/utils';

type GameOverlayProps = {
  show: boolean;
  type: 'paused' | 'gameover';
  score?: number;
};

export const GameOverlay = ({ show, type, score }: GameOverlayProps) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
      <div className="text-center animate-scale-in">
        {type === 'paused' ? (
          <>
            <h2 className="text-2xl font-arcade neon-glow-cyan text-secondary mb-4">PAUSED</h2>
            <p className="text-sm text-muted-foreground">Press SPACE or START to continue</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-arcade neon-glow-pink text-accent mb-4">GAME OVER</h2>
            {score !== undefined && (
              <p className="text-xl font-arcade text-primary mb-4">
                SCORE: {score}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Press SPACE to play again</p>
          </>
        )}
      </div>
    </div>
  );
};
