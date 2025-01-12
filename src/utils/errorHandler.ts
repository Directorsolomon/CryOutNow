
import { toast } from '@/components/ui/use-toast';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const handleError = (error: unknown) => {
  const message = error instanceof AppError 
    ? error.message 
    : 'An unexpected error occurred';
    
  toast({
    variant: "destructive",
    title: "Error",
    description: message
  });
  
  console.error('[Error]:', error);
};
