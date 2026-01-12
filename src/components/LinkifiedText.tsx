import { useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const navigate = useNavigate();
  const [externalLinkDialogOpen, setExternalLinkDialogOpen] = useState(false);
  const [pendingExternalUrl, setPendingExternalUrl] = useState<string | null>(null);

  const currentOrigin = window.location.origin;

  const isInternalLink = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin === currentOrigin;
    } catch {
      return false;
    }
  };

  const getInternalPath = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search + urlObj.hash;
    } catch {
      return '/';
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    
    if (isInternalLink(url)) {
      navigate(getInternalPath(url));
    } else {
      setPendingExternalUrl(url);
      setExternalLinkDialogOpen(true);
    }
  };

  const handleConfirmExternal = () => {
    if (pendingExternalUrl) {
      window.open(pendingExternalUrl, '_blank', 'noopener,noreferrer');
    }
    setExternalLinkDialogOpen(false);
    setPendingExternalUrl(null);
  };

  const handleCancelExternal = () => {
    setExternalLinkDialogOpen(false);
    setPendingExternalUrl(null);
  };

  const parts = useMemo(() => {
    const result: Array<{ type: 'text' | 'link'; content: string }> = [];
    let lastIndex = 0;
    let match;

    const regex = new RegExp(URL_REGEX.source, 'gi');
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }
      
      // Add the link
      result.push({
        type: 'link',
        content: match[0],
      });
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }
    
    return result;
  }, [text]);

  const getDisplayUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const display = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
      return display.length > 40 ? display.slice(0, 37) + '...' : display;
    } catch {
      return url.length > 40 ? url.slice(0, 37) + '...' : url;
    }
  };

  return (
    <>
      <span className={className}>
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <Fragment key={index}>{part.content}</Fragment>;
          }
          
          const isInternal = isInternalLink(part.content);
          
          return (
            <a
              key={index}
              href={part.content}
              onClick={(e) => handleLinkClick(e, part.content)}
              className="inline-flex items-center gap-0.5 text-primary hover:text-primary/80 underline underline-offset-2 break-all"
              title={part.content}
            >
              {getDisplayUrl(part.content)}
              {!isInternal && (
                <ExternalLink className="inline h-3 w-3 flex-shrink-0 ml-0.5" />
              )}
            </a>
          );
        })}
      </span>

      <AlertDialog open={externalLinkDialogOpen} onOpenChange={setExternalLinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Leaving MovieReviewHub
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You're about to visit an external website:</p>
              <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                {pendingExternalUrl}
              </p>
              <p>Are you sure you want to leave the app?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelExternal}>
              Stay here
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExternal}>
              Open link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
