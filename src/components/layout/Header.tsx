import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Gamepad2, Trophy, Eye, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'PLAY', icon: Gamepad2 },
    { path: '/leaderboard', label: 'RANKS', icon: Trophy },
    { path: '/spectate', label: 'WATCH', icon: Eye },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-arcade neon-glow text-primary">SNAKE</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'font-arcade text-xs gap-2',
                    location.pathname === path && 'neon-box'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline text-foreground">{user?.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="font-arcade text-xs gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">LOGIN</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
