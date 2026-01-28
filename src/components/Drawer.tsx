import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Settings, 
  Shield, 
  LogIn, 
  UserPlus, 
  LogOut,
  Film,
  BarChart3,
  Home,
  User,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function Drawer() {
  const location = useLocation();
  const { isDrawerOpen, setIsDrawerOpen } = useApp();
  const { user, isAdmin, signOut, displayName } = useAuth();

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname, setIsDrawerOpen]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setIsDrawerOpen]);

  // Prevent app scroll when drawer is open (important when #root is the scroll container)
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    if (isDrawerOpen) {
      root.style.overflow = 'hidden';
    } else {
      root.style.overflow = '';
    }
    return () => {
      root.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    await signOut();
    setIsDrawerOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsDrawerOpen(false)}
      />
      
      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full safe-area-inset-top safe-area-inset-bottom">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border/50 bg-sidebar-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Film className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-sidebar-foreground text-lg">
                  MovieHub
                </span>
                <p className="text-xs text-sidebar-foreground/50">By Kaka</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <ScrollArea className="flex-1">
            <nav className="p-4">
              {/* Quick Access Section */}
              <div className="mb-6">
                <h3 className="px-3 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Quick Access
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/"
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                        isActive('/') 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        isActive('/') ? 'bg-primary-foreground/20' : 'bg-sidebar-accent group-hover:bg-primary/10'
                      )}>
                        <Home className="w-4 h-4" />
                      </div>
                      Home
                      <ChevronRight className={cn(
                        'w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all',
                        'group-hover:opacity-100 group-hover:translate-x-0'
                      )} />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings"
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                        isActive('/settings') 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        isActive('/settings') ? 'bg-primary-foreground/20' : 'bg-sidebar-accent group-hover:bg-primary/10'
                      )}>
                        <Settings className="w-4 h-4" />
                      </div>
                      Settings
                      <ChevronRight className={cn(
                        'w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all',
                        'group-hover:opacity-100 group-hover:translate-x-0'
                      )} />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/analytics"
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                        isActive('/analytics') 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        isActive('/analytics') ? 'bg-primary-foreground/20' : 'bg-sidebar-accent group-hover:bg-primary/10'
                      )}>
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      Analytics
                      <ChevronRight className={cn(
                        'w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all',
                        'group-hover:opacity-100 group-hover:translate-x-0'
                      )} />
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                          isActive('/admin') 
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                          isActive('/admin') ? 'bg-primary-foreground/20' : 'bg-sidebar-accent group-hover:bg-amber-500/10'
                        )}>
                          <Shield className="w-4 h-4 text-amber-500" />
                        </div>
                        Admin Panel
                        <ChevronRight className={cn(
                          'w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all',
                          'group-hover:opacity-100 group-hover:translate-x-0'
                        )} />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
              
              <Separator className="my-4 bg-sidebar-border/50" />
              
              {/* Account Section */}
              <div>
                <h3 className="px-3 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Account
                </h3>
                <ul className="space-y-1">
                  {user ? (
                    <>
                      <li className="px-3 py-3 mx-1 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                            <span className="text-sm font-bold text-primary">
                              {(displayName || user.email?.charAt(0) || 'U').toUpperCase().charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-sidebar-foreground truncate">
                              {displayName || user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-sidebar-foreground/50 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          Logout
                          <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/login"
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                            isActive('/login') 
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                              : 'text-sidebar-foreground hover:bg-sidebar-accent'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                            isActive('/login') ? 'bg-primary-foreground/20' : 'bg-sidebar-accent group-hover:bg-primary/10'
                          )}>
                            <LogIn className="w-4 h-4" />
                          </div>
                          Login
                          <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/signup"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                            <UserPlus className="w-4 h-4" />
                          </div>
                          Create Account
                          <ChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </nav>
          </ScrollArea>
          
          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-accent/20">
            <div className="flex items-center justify-center gap-2 text-xs text-sidebar-foreground/40">
              <Film className="w-3 h-3" />
              <span>MovieReviewHub</span>
              <span>•</span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
