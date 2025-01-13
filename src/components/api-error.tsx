import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ApiErrorProps {
  error: Error;
  resetError?: () => void;
  retry?: () => void;
}

export function ApiError({ error, resetError, retry }: ApiErrorProps) {
  const isNetworkError = error.message.includes('network') || 
    error.message.includes('Failed to fetch') ||
    !navigator.onLine;

  const is404 = error.message.includes('404') || 
    error.message.includes('not found');

  const is401 = error.message.includes('401') || 
    error.message.includes('unauthorized');

  const is403 = error.message.includes('403') || 
    error.message.includes('forbidden');

  const getErrorDetails = () => {
    if (isNetworkError) {
      return {
        title: 'Network Error',
        description: 'Please check your internet connection and try again',
        icon: WifiOff,
      };
    }

    if (is404) {
      return {
        title: 'Not Found',
        description: 'The requested resource could not be found',
        icon: AlertTriangle,
      };
    }

    if (is401) {
      return {
        title: 'Unauthorized',
        description: 'Please log in to access this resource',
        icon: AlertTriangle,
      };
    }

    if (is403) {
      return {
        title: 'Access Denied',
        description: 'You do not have permission to access this resource',
        icon: AlertTriangle,
      };
    }

    return {
      title: 'Error',
      description: 'An error occurred while processing your request',
      icon: AlertTriangle,
    };
  };

  const { title, description, icon: Icon } = getErrorDetails();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {error.message}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isNetworkError && (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <Wifi className="h-4 w-4" />
            Check Connection
          </Button>
        )}
        {retry && (
          <Button onClick={retry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {resetError && (
          <Button variant="ghost" onClick={resetError}>
            Dismiss
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ApiError error={error} resetError={resetErrorBoundary} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
} 
