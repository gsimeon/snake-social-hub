import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { leaderboardApi } from '@/services/api';
import { LeaderboardEntry } from '@/types/game';
import { SkinSelector } from '@/components/game/SkinSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Trophy, Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
    const { user } = useAuth();
    const [scores, setScores] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            leaderboardApi.getLeaderboard(undefined, user.username).then(response => {
                if (response.success && response.data) {
                    setScores(response.data);
                }
                setLoading(false);
            });
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-muted-foreground">Please log in to view your profile.</p>
            </div>
        );
    }

    const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
    const totalGames = scores.length;
    const wallGames = scores.filter(s => s.mode === 'walls').length;
    const passGames = scores.filter(s => s.mode === 'passthrough').length;

    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <Card className="w-full md:w-1/3 border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <span className="text-4xl">👾</span>
                        </div>
                        <CardTitle className="text-2xl font-arcade neon-glow text-primary truncate">
                            {user.username}
                        </CardTitle>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-2">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator className="bg-primary/20" />
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground font-arcade">BEST SCORE</p>
                                <p className="text-xl font-bold text-yellow-400">{bestScore}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-arcade">GAMES PLAYED</p>
                                <p className="text-xl font-bold text-primary">{totalGames}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="w-full md:w-2/3 space-y-6">
                    {/* Customization */}
                    <SkinSelector />

                    {/* Recent Games */}
                    <Card className="border-primary/20 bg-card/50 backdrop-blur h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl font-arcade text-primary flex items-center gap-2">
                                <Gamepad2 className="w-5 h-5" />
                                GAME HISTORY
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            {loading ? (
                                <p className="text-center py-8 text-muted-foreground">Loading history...</p>
                            ) : scores.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">No games played yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {scores.map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={entry.mode === 'walls' ? 'destructive' : 'secondary'} className="font-arcade text-[10px] w-16 justify-center">
                                                    {entry.mode === 'walls' ? 'WALLS' : 'PASS'}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">{entry.date}</span>
                                            </div>
                                            <span className="font-arcade text-primary text-lg">{entry.score}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
