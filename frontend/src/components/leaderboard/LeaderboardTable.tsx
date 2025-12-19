import { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { leaderboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LeaderboardTable = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const response = await leaderboardApi.getLeaderboard(filter === 'all' ? undefined : filter);
      if (response.success && response.data) {
        setEntries(response.data);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl font-arcade neon-glow text-primary text-center">
          LEADERBOARD
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as GameMode | 'all')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="font-arcade text-xs">ALL</TabsTrigger>
            <TabsTrigger value="walls" className="font-arcade text-xs">WALLS</TabsTrigger>
            <TabsTrigger value="passthrough" className="font-arcade text-xs">PASS</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg transition-all',
                      index === 0 && 'bg-yellow-500/10 border border-yellow-500/30',
                      index === 1 && 'bg-gray-400/10 border border-gray-400/30',
                      index === 2 && 'bg-amber-600/10 border border-amber-600/30',
                      index > 2 && 'bg-muted/30 border border-border'
                    )}
                  >
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.username}</p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                    <Badge variant={entry.mode === 'walls' ? 'destructive' : 'secondary'} className="font-arcade text-xs">
                      {entry.mode === 'walls' ? 'WALLS' : 'PASS'}
                    </Badge>
                    <p className="text-xl font-arcade text-primary">{entry.score}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
