import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, User, Trash2, Shield, ExternalLink, Smartphone, Download, Check, Film, MessageSquare, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { InstallAppGuide } from '@/components/InstallAppGuide';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { usePWAInstallPrompt, trackInstallAttempt } from '@/hooks/usePWAInstall';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, displayName, deleteAccount } = useAuth();
  const { deviceId } = useApp();
  const { canInstall, isInstalled, promptInstall } = usePWAInstallPrompt();
  const { preferences, updatePreference } = useNotificationPreferences();
  
  const [isInstalling, setIsInstalling] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);


  const handleClearCache = () => {
    // Keep deviceId
    const savedDeviceId = localStorage.getItem('deviceId');
    localStorage.clear();
    if (savedDeviceId) {
      localStorage.setItem('deviceId', savedDeviceId);
    }
    toast({
      title: 'Cache cleared',
      description: 'Local data has been cleared.',
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const { error } = await deleteAccount();
    setIsDeletingAccount(false);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account deleted',
        description: 'Your account and data have been permanently deleted.',
      });
      navigate('/');
    }
  };

  const handleInstallApp = async () => {
    if (canInstall) {
      setIsInstalling(true);
      
      // Track that we prompted
      await trackInstallAttempt(deviceId, user?.id || null, 'prompted', 'settings');
      
      try {
        const accepted = await promptInstall();
        
        // Track the outcome
        await trackInstallAttempt(
          deviceId, 
          user?.id || null, 
          accepted ? 'accepted' : 'dismissed', 
          'settings'
        );
        
        if (accepted) {
          toast({
            title: 'Installing...',
            description: 'The app is being installed on your device.',
          });
        } else {
          toast({
            title: 'Installation cancelled',
            description: 'You can install the app anytime.',
          });
        }
      } catch (error) {
        console.error('Install error:', error);
        await trackInstallAttempt(deviceId, user?.id || null, 'fallback', 'settings');
        setGuideOpen(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Fallback: Show manual installation guide
      await trackInstallAttempt(deviceId, user?.id || null, 'fallback', 'settings');
      setGuideOpen(true);
    }
  };

  return (
    <div className="min-h-full cinema-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-foreground hover:bg-muted mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 pb-20">
        {/* Badge Notifications Section */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            <Bell className="w-4 h-4" />
            Badge Notifications
          </h2>

          <div className="glass-card rounded-xl p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose which items show in the notification badge count
            </p>
            
            <Separator className="bg-border/50" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Film className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <Label htmlFor="show-reviews" className="text-foreground font-medium">
                    New Reviews
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show badge for new movie reviews
                  </p>
                </div>
              </div>
              <Switch
                id="show-reviews"
                checked={preferences.showReviews}
                onCheckedChange={(checked) => updatePreference('showReviews', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div>
                  <Label htmlFor="show-comments" className="text-foreground font-medium">
                    New Comments
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show badge for new comments
                  </p>
                </div>
              </div>
              <Switch
                id="show-comments"
                checked={preferences.showComments}
                onCheckedChange={(checked) => updatePreference('showComments', checked)}
              />
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            <User className="w-4 h-4" />
            Account
          </h2>
          <div className="glass-card rounded-xl p-4">
            {user ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Display Name</p>
                  <p className="text-foreground">{displayName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{user.email}</p>
                </div>
                <Separator className="bg-border/50" />
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and all your data including comments and profile information. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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

        {/* Install App Section */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            <Download className="w-4 h-4" />
            Install App
          </h2>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                {isInstalled ? (
                  <Check className="w-6 h-6 text-green-500" />
                ) : (
                  <Smartphone className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isInstalled ? (
                  <>
                    <h3 className="font-semibold text-foreground mb-1">App Installed</h3>
                    <p className="text-sm text-green-500">
                      You're using the installed app version. Enjoy the native experience!
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-foreground mb-1">Add to Home Screen</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Install this app on your device for quick access and a native app experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={handleInstallApp}
                        disabled={isInstalling}
                        size="sm" 
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Download className={`w-4 h-4 mr-2 ${isInstalling ? 'animate-pulse' : ''}`} />
                        {isInstalling ? 'Installing...' : canInstall ? 'Install Now' : 'See How to Install'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
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
            <button
              onClick={() => navigate('/privacy-policy')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>MovieReviewHub By Kaka</p>
          <p className="text-xs mt-1">Version 1.0.0</p>
        </div>
      </main>

      <InstallAppGuide open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}
