
import { toast } from '@/components/ui/use-toast';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
    return;
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
};
