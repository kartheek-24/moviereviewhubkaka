import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordCriteria {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const criteria: PasswordCriteria[] = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = criteria.filter(c => c.met).length;
    return (metCount / criteria.length) * 100;
  }, [criteria]);

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return { text: '', color: '' };
    if (strength <= 20) return { text: 'Very Weak', color: 'text-destructive' };
    if (strength <= 40) return { text: 'Weak', color: 'text-orange-500' };
    if (strength <= 60) return { text: 'Fair', color: 'text-yellow-500' };
    if (strength <= 80) return { text: 'Strong', color: 'text-lime-500' };
    return { text: 'Very Strong', color: 'text-green-500' };
  }, [password.length, strength]);

  const progressColor = useMemo(() => {
    if (strength <= 20) return 'bg-destructive';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  }, [strength]);

  if (password.length === 0) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={strengthLabel.color}>{strengthLabel.text}</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1">
        {criteria.map((criterion, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 text-xs transition-colors ${
              criterion.met ? 'text-green-500' : 'text-muted-foreground'
            }`}
          >
            {criterion.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {criterion.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
