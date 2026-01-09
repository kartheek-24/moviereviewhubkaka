import { cn } from '@/lib/utils';

interface LanguageBadgeProps {
  language: string;
  className?: string;
}

const languageColors: Record<string, string> = {
  English: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Telugu: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Hindi: 'bg-green-500/20 text-green-400 border-green-500/30',
  Kannada: 'bg-red-500/20 text-red-400 border-red-500/30',
  Tamil: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Malayalam: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export function LanguageBadge({ language, className }: LanguageBadgeProps) {
  const colorClass = languageColors[language] || 'bg-muted text-muted-foreground border-muted';
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
        colorClass,
        className
      )}
    >
      {language}
    </span>
  );
}
