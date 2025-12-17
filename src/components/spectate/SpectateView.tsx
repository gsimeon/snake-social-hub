import { useState, useEffect, useCallback } from 'react';
import { ActivePlayer } from '@/types/game';
import { playersApi } from '@/services/api';
import { SpectateCard } from './SpectateCard';
import { GameBoard } from '@/components/game/GameBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users } from 'lucide-react';

export const SpectateView = () => {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    const response = await playersApi.getActivePlayers();
    if (response.success && response.data) {
      setPlayers(response.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Simulate player movement when spectating
  useEffect(() => {
    if (!selectedPlayer) return;

    const interval = setInterval(() => {
      setSelectedPlayer(prev => {
        if (!prev) return null;
        return playersApi.simulatePlayerMove(prev);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [selectedPlayer?.id]);

  // Also update the players list periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => prev.map(p => playersApi.simulatePlayerMove(p)));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading active players...</p>
      </div>
    );
  }

  if (selectedPlayer) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedPlayer(null)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Players
        </Button>

        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <span className="text-lg">{selectedPlayer.username}</span>
                <Badge variant={selectedPlayer.mode === 'walls' ? 'destructive' : 'secondary'}>
                  {selectedPlayer.mode === 'walls' ? 'WALLS' : 'PASS-THROUGH'}
                </Badge>
              </CardTitle>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-arcade text-primary">{selectedPlayer.score}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GameBoard 
              snake={selectedPlayer.snake} 
              food={selectedPlayer.food} 
              mode={selectedPlayer.mode}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xl font-arcade neon-glow-cyan text-secondary">
        <Users className="w-6 h-6" />
        LIVE PLAYERS ({players.length})
      </div>

      {players.length === 0 ? (
        <Card className="border-border bg-card/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No players currently online</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <SpectateCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
