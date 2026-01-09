import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, User, Trash2, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock state
const isLoggedIn = false;

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleTogglePush = async (enabled: boolean) => {
    if (enabled) {
      setIsRequestingPermission(true);
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushEnabled(true);
          toast({
            title: 'Notifications enabled',
            description: "You'll receive notifications for new reviews.",
          });
        } else {
          toast({
            title: 'Permission denied',
            description: 'Please enable notifications in your browser settings.',
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to request notification permission.',
          variant: 'destructive',
        });
      } finally {
        setIsRequestingPermission(false);
      }
    } else {
      setPushEnabled(false);
      toast({
        title: 'Notifications disabled',
        description: "You won't receive notifications for new reviews.",
      });
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({
      title: 'Cache cleared',
      description: 'Local data has been cleared.',
    });
  };

  return (
    <div className="min-h-screen cinema-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground hover:bg-muted mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 pb-20">
        {/* Notifications Section */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            <Bell className="w-4 h-4" />
            Notifications
          </h2>
          <div className="glass-card rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push" className="text-foreground font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new reviews are posted
                </p>
              </div>
              <Switch
                id="push"
                checked={pushEnabled}
                onCheckedChange={handleTogglePush}
                disabled={isRequestingPermission}
              />
            </div>
            
            {!pushEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTogglePush(true)}
                disabled={isRequestingPermission}
                className="w-full"
              >
                {isRequestingPermission ? 'Requesting...' : 'Request Permission'}
              </Button>
            )}
          </div>
        </section>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            <User className="w-4 h-4" />
            Account
          </h2>
          <div className="glass-card rounded-xl p-4">
            {isLoggedIn ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">user@example.com</p>
                </div>
                <Separator className="bg-border/50" />
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
                <Button variant="destructive" className="w-full">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to save your preferences and comment history
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/signup')}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Other Section */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            <Shield className="w-4 h-4" />
            Other
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Clear Cache</span>
              </div>
            </button>
            <a
              href="#"
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>MovieReviewHub By Kaka</p>
          <p className="text-xs mt-1">Version 1.0.0</p>
        </div>
      </main>
    </div>
  );
}
