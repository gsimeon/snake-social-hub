import { Position, GameMode } from '@/types/game';
import { cn } from '@/lib/utils';

type GameBoardProps = {
  snake: Position[];
  food: Position;
  mode: GameMode;
  isSpectating?: boolean;
  playerColor?: string;
};

const GRID_SIZE = 20;
const CELL_SIZE = 20;

export const GameBoard = ({ snake, food, mode, isSpectating = false, playerColor = 'primary' }: GameBoardProps) => {
  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    return (
      <div
        key={`${x}-${y}`}
        className={cn(
          'w-5 h-5 border border-border/20 transition-all duration-75',
          isSnakeHead && 'bg-primary rounded-sm neon-box animate-snake-move',
          isSnakeBody && 'bg-primary/80 rounded-sm',
          isFood && 'bg-accent rounded-full animate-pulse-neon',
          !isSnakeHead && !isSnakeBody && !isFood && 'bg-transparent'
        )}
        style={{
          boxShadow: isSnakeHead 
            ? '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))' 
            : isFood 
              ? '0 0 10px hsl(var(--accent)), 0 0 20px hsl(var(--accent))'
              : undefined,
        }}
      />
    );
  };

  return (
    <div 
      className={cn(
        'relative game-grid border-2 rounded-lg p-1',
        mode === 'walls' ? 'border-destructive/50' : 'border-secondary/50',
        isSpectating && 'scale-75 origin-top-left'
      )}
      style={{
        width: GRID_SIZE * CELL_SIZE + 8,
        height: GRID_SIZE * CELL_SIZE + 8,
        boxShadow: mode === 'walls' 
          ? '0 0 20px hsl(var(--destructive) / 0.3), inset 0 0 30px hsl(var(--destructive) / 0.1)'
          : '0 0 20px hsl(var(--secondary) / 0.3), inset 0 0 30px hsl(var(--secondary) / 0.1)',
      }}
    >
      <div 
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          return renderCell(x, y);
        })}
      </div>
      
      {/* Mode indicator */}
      <div className={cn(
        'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-arcade',
        mode === 'walls' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'
      )}>
        {mode === 'walls' ? 'WALLS' : 'PASS'}
      </div>
    </div>
  );
};
