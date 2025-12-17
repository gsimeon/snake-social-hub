import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type AuthFormProps = {
  onSuccess?: () => void;
};

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const { login, signup, loading, error } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const response = await login(loginData.email, loginData.password);
    if (response.success && onSuccess) {
      onSuccess();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (signupData.password !== signupData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    const response = await signup(signupData.username, signupData.email, signupData.password);
    if (response.success && onSuccess) {
      onSuccess();
    }
  };

  const displayError = localError || error;

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-arcade neon-glow text-primary">SNAKE GAME</CardTitle>
        <CardDescription>Sign in to save your scores</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="font-arcade text-xs">LOGIN</TabsTrigger>
            <TabsTrigger value="signup" className="font-arcade text-xs">SIGN UP</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="player@snake.game"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              {displayError && (
                <p className="text-sm text-destructive">{displayError}</p>
              )}
              <Button type="submit" className="w-full font-arcade" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'LOGIN'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="SnakeMaster"
                  value={signupData.username}
                  onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="player@snake.game"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              {displayError && (
                <p className="text-sm text-destructive">{displayError}</p>
              )}
              <Button type="submit" className="w-full font-arcade" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIGN UP'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
