import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Facebook, MessageCircle, QrCode, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  url: string;
}

// Twitter/X icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function ShareDialog({ open, onOpenChange, title, text, url }: ShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Check if we're in preview mode (lovableproject.com URLs are not publicly accessible)
  const isPreviewMode = useMemo(() => {
    return window.location.hostname.includes('lovableproject.com');
  }, []);

  // Get the shareable URL - use the published URL if available
  const shareableUrl = useMemo(() => {
    // If we're on a custom domain or lovable.app, use the current URL
    if (!isPreviewMode) {
      return url;
    }
    // In preview mode, construct a relative path that will work once published
    const path = new URL(url).pathname;
    return `${window.location.origin}${path}`;
  }, [url, isPreviewMode]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: isPreviewMode 
          ? 'Link copied. Note: Publish your app for the link to work publicly.'
          : 'Review link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
        variant: 'destructive',
      });
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareableUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('share-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast({
        title: 'QR Code downloaded!',
        description: 'The QR code has been saved to your device.',
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Share Review</DialogTitle>
        </DialogHeader>

        {isPreviewMode && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm text-amber-200">
              You're in preview mode. <strong>Publish your app</strong> to share links that work publicly.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="mt-4 space-y-4">
            {/* Social Media Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-muted"
                onClick={shareToTwitter}
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <XIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">X / Twitter</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-muted"
                onClick={shareToFacebook}
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">Facebook</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-muted"
                onClick={shareToWhatsApp}
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">WhatsApp</span>
              </Button>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <Input
                value={shareableUrl}
                readOnly
                className="flex-1 text-sm bg-muted"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  id="share-qr-code"
                  value={shareableUrl}
                  size={200}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: '/favicon.ico',
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {isPreviewMode 
                  ? 'QR code will work after publishing your app'
                  : 'Scan this QR code to open the review on another device'}
              </p>
              <Button onClick={handleDownloadQR} variant="outline" className="w-full">
                Download QR Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
