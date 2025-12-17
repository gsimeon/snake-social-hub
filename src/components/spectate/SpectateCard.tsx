import { ActivePlayer } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { GameBoard } from '@/components/game/GameBoard';

type SpectateCardProps = {
  player: ActivePlayer;
  onClick: () => void;
  isSelected?: boolean;
};

export const SpectateCard = ({ player, onClick, isSelected }: SpectateCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 border-2 ${
        isSelected ? 'border-primary neon-box' : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            {player.username}
          </CardTitle>
          <Badge variant={player.mode === 'walls' ? 'destructive' : 'secondary'} className="text-xs">
            {player.mode === 'walls' ? 'WALLS' : 'PASS'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Score</span>
          <span className="font-arcade text-primary">{player.score}</span>
        </div>
        <div className="transform scale-[0.35] origin-top-left w-[150px] h-[150px] overflow-hidden">
          <GameBoard 
            snake={player.snake} 
            food={player.food} 
            mode={player.mode}
            isSpectating
          />
        </div>
      </CardContent>
    </Card>
  );
};
