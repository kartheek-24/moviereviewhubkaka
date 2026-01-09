import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Globe, 
  Settings, 
  Shield, 
  LogIn, 
  UserPlus, 
  User, 
  LogOut,
  Film
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { languages } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Mock auth state - will be replaced with real auth
const isLoggedIn = false;
const isAdmin = false;

export function Drawer() {
  const location = useLocation();
  const { isDrawerOpen, setIsDrawerOpen, selectedLanguage, setSelectedLanguage } = useApp();

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

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleLanguageSelect = (language: string | null) => {
    setSelectedLanguage(language);
    setIsDrawerOpen(false);
  };

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
          'fixed top-0 left-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border',
          'transform transition-transform duration-300 ease-out',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full safe-area-inset-top safe-area-inset-bottom">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-semibold text-sidebar-foreground">
                Menu
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <ScrollArea className="flex-1">
            <nav className="p-3">
              {/* Languages Section */}
              <div className="mb-4">
                <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  Languages
                </h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleLanguageSelect(null)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedLanguage === null
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <Globe className="w-4 h-4" />
                      All Languages
                    </button>
                  </li>
                  {languages.map((lang) => (
                    <li key={lang}>
                      <button
                        onClick={() => handleLanguageSelect(lang)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          selectedLanguage === lang
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        <span className="w-4 h-4 flex items-center justify-center text-xs font-medium">
                          {lang.charAt(0)}
                        </span>
                        {lang}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator className="my-3 bg-sidebar-border" />
              
              {/* Navigation Section */}
              <div className="mb-4">
                <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  Navigation
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
              
              <Separator className="my-3 bg-sidebar-border" />
              
              {/* Account Section */}
              <div>
                <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  Account
                </h3>
                <ul className="space-y-1">
                  {isLoggedIn ? (
                    <>
                      <li>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {/* logout */}}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/signup"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </nav>
          </ScrollArea>
          
          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50 text-center">
              MovieReviewHub By Kaka
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
