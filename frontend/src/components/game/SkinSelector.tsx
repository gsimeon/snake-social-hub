import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const SKINS = [
    { id: 'green', name: 'Classic Green', color: 'bg-green-500' },
    { id: 'blue', name: 'Azure Blue', color: 'bg-blue-500' },
    { id: 'red', name: 'Ruby Red', color: 'bg-red-500' },
    { id: 'yellow', name: 'Golden Sun', color: 'bg-yellow-400' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-purple-500' },
    { id: 'pink', name: 'Neon Pink', color: 'bg-pink-500' },
];

export const SkinSelector = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);

    if (!user) return null;

    const handleSkinChange = async (skinId: string) => {
        setLoading(skinId);
        await updateProfile(skinId);
        setLoading(null);
    };

    return (
        <Card className="w-full border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
                <CardTitle className="text-xl font-arcade neon-glow text-primary text-center">
                    CUSTOMIZE SNAKE
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {SKINS.map((skin) => (
                        <Button
                            key={skin.id}
                            variant="outline"
                            className={cn(
                                "h-24 flex flex-col gap-2 p-2 hover:bg-muted/50 transition-all",
                                user.skin === skin.id && "border-primary ring-2 ring-primary/50 bg-primary/10"
                            )}
                            onClick={() => handleSkinChange(skin.id)}
                            disabled={!!loading}
                        >
                            <div className={cn("w-full h-8 rounded-full shadow-lg", skin.color)} />
                            <span className="font-arcade text-xs">{skin.name}</span>
                            {loading === skin.id && <Loader2 className="w-4 h-4 animate-spin" />}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
