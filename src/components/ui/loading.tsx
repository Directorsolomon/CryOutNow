/**
 * @file loading.tsx
 * @description Reusable loading components for different scenarios
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  /** Additional CSS classes */
  className?: string;
  /** Size of the spinner in pixels */
  size?: number;
  /** Text to display below the spinner */
  text?: string;
  /** Whether to center the spinner in its container */
  center?: boolean;
  /** Whether to show a full-page loading state */
  fullPage?: boolean;
}

/**
 * LoadingSpinner Component
 * @component
 * @description A flexible loading spinner component with various display options
 */
export function LoadingSpinner({ 
  className, 
  size = 24, 
  text, 
  center = false,
  fullPage = false,
}: LoadingProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      center && 'h-full w-full',
      fullPage && 'fixed inset-0 bg-background/80 backdrop-blur-sm',
      className
    )}>
      <Loader2 
        className="animate-spin" 
        size={size}
      />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );

  return content;
}

/**
 * LoadingOverlay Component
 * @component
 * @description A loading overlay that covers its parent container
 */
export function LoadingOverlay({ className, text }: LoadingProps) {
  return (
    <div className={cn(
      'absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm',
      className
    )}>
      <LoadingSpinner text={text} />
    </div>
  );
}

/**
 * LoadingPage Component
 * @component
 * @description A full-page loading state
 */
export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <LoadingSpinner 
      fullPage 
      size={32} 
      text={text} 
      center 
    />
  );
}

/**
 * LoadingButton Component
 * @component
 * @description A button-sized loading indicator
 */
export function LoadingButton({ className }: { className?: string }) {
  return (
    <LoadingSpinner 
      size={16} 
      className={cn('py-2', className)} 
    />
  );
} 
