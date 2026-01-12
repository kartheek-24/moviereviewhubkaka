import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Smartphone, Share2, MoreVertical, Plus, Check, Chrome, Compass } from 'lucide-react';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const androidSteps: Step[] = [
  {
    icon: <Chrome className="w-6 h-6" />,
    title: 'Open in Chrome',
    description: 'Make sure you\'re viewing this website in the Chrome browser',
  },
  {
    icon: <MoreVertical className="w-6 h-6" />,
    title: 'Tap Menu',
    description: 'Tap the three-dot menu icon (⋮) in the top-right corner',
  },
  {
    icon: <Plus className="w-6 h-6" />,
    title: 'Add to Home Screen',
    description: 'Select "Add to Home screen" or "Install app" from the menu',
  },
  {
    icon: <Check className="w-6 h-6" />,
    title: 'Confirm',
    description: 'Tap "Add" to confirm. The app icon will appear on your home screen!',
  },
];

const iosSafariSteps: Step[] = [
  {
    icon: <Compass className="w-6 h-6" />,
    title: 'Open in Safari',
    description: 'Open this website in the Safari browser (not Chrome)',
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Tap Share',
    description: 'Tap the Share button (square with arrow pointing up) at the bottom',
  },
  {
    icon: <Plus className="w-6 h-6" />,
    title: 'Add to Home Screen',
    description: 'Scroll down and tap "Add to Home Screen"',
  },
  {
    icon: <Check className="w-6 h-6" />,
    title: 'Confirm',
    description: 'Customize the name if you want, then tap "Add"',
  },
];

const iosChromeSteps: Step[] = [
  {
    icon: <Chrome className="w-6 h-6" />,
    title: 'Open in Chrome',
    description: 'You\'re viewing this in Chrome browser',
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Tap Share',
    description: 'Tap the share icon (three dots → Share)',
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: 'Open in Safari',
    description: 'For the best experience, copy the link and open in Safari',
  },
  {
    icon: <Plus className="w-6 h-6" />,
    title: 'Follow Safari Steps',
    description: 'Then follow the Safari instructions to add to home screen',
  },
];

function PhoneMockup({ platform, activeStep }: { platform: 'android' | 'ios-safari' | 'ios-chrome'; activeStep: number }) {
  return (
    <div className="relative mx-auto w-32 h-56 bg-muted/30 rounded-3xl border-4 border-muted p-2 mb-6">
      {/* Screen */}
      <div className="w-full h-full bg-background rounded-2xl overflow-hidden relative">
        {/* Status bar */}
        <div className="h-5 bg-muted/50 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>
        
        {/* Content area */}
        <div className="p-2 space-y-2">
          <div className="h-2 bg-muted/50 rounded w-full" />
          <div className="h-2 bg-muted/50 rounded w-3/4" />
          <div className="h-8 bg-primary/20 rounded mt-2" />
        </div>

        {/* Highlight areas based on platform and step */}
        {platform === 'android' && activeStep === 1 && (
          <div className="absolute top-5 right-1 w-5 h-5 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded animate-pulse flex items-center justify-center">
              <MoreVertical className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
        )}

        {(platform === 'ios-safari' || platform === 'ios-chrome') && activeStep === 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded animate-pulse flex items-center justify-center">
              <Share2 className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="glass-card p-2 rounded-lg animate-scale-in">
              <div className="flex items-center gap-1 text-[8px] text-foreground">
                <Plus className="w-3 h-3 text-primary" />
                <span>Add to Home</span>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 bg-primary rounded-xl animate-bounce flex items-center justify-center shadow-lg">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Home button (for iOS) */}
      {(platform === 'ios-safari' || platform === 'ios-chrome') && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-muted rounded-full" />
      )}
    </div>
  );
}

function StepCard({ step, index, isActive }: { step: Step; index: number; isActive: boolean }) {
  return (
    <div 
      className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-primary/10 border border-primary/30 scale-[1.02]' 
          : 'bg-muted/30 border border-transparent'
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        {step.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            Step {index + 1}
          </span>
        </div>
        <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
      </div>
    </div>
  );
}

interface InstallAppGuideProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InstallAppGuide({ trigger, open, onOpenChange }: InstallAppGuideProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [defaultTab, setDefaultTab] = useState<string>('android');

  // Detect device
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      if (/crios/.test(userAgent)) {
        setDefaultTab('ios-chrome');
      } else {
        setDefaultTab('ios-safari');
      }
    } else {
      setDefaultTab('android');
    }
  }, []);

  // Auto-rotate steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const getSteps = (tab: string) => {
    switch (tab) {
      case 'android':
        return androidSteps;
      case 'ios-safari':
        return iosSafariSteps;
      case 'ios-chrome':
        return iosChromeSteps;
      default:
        return androidSteps;
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-foreground">
          <Smartphone className="w-5 h-5 text-primary" />
          Install as App
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue={defaultTab} className="w-full" onValueChange={() => setActiveStep(0)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="android" className="text-xs">
            <Chrome className="w-3 h-3 mr-1" />
            Android
          </TabsTrigger>
          <TabsTrigger value="ios-safari" className="text-xs">
            <Compass className="w-3 h-3 mr-1" />
            Safari
          </TabsTrigger>
          <TabsTrigger value="ios-chrome" className="text-xs">
            <Chrome className="w-3 h-3 mr-1" />
            iOS Chrome
          </TabsTrigger>
        </TabsList>

        {['android', 'ios-safari', 'ios-chrome'].map((platform) => (
          <TabsContent key={platform} value={platform} className="space-y-4 mt-0">
            <PhoneMockup 
              platform={platform as 'android' | 'ios-safari' | 'ios-chrome'} 
              activeStep={activeStep} 
            />
            
            <div className="space-y-2">
              {getSteps(platform).map((step, index) => (
                <StepCard 
                  key={index} 
                  step={step} 
                  index={index} 
                  isActive={index === activeStep}
                />
              ))}
            </div>

            {platform === 'ios-chrome' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-400">
                  <strong>Pro tip:</strong> Safari provides the best PWA experience on iOS. Chrome has limited support for home screen apps.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Button 
        onClick={() => onOpenChange?.(false)} 
        className="w-full mt-2"
      >
        Got it!
      </Button>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
