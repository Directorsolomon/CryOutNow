declare module 'input-otp' {
  import { ReactNode } from 'react';

  export interface OTPInputProps {
    maxLength?: number;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    inputMode?: 'numeric' | 'text';
    pattern?: string;
    placeholder?: string;
    separator?: ReactNode;
    containerClassName?: string;
    inputClassName?: string;
    separatorClassName?: string;
    isInvalid?: boolean;
  }

  export interface OTPInputContextType {
    slots: Array<{
      char: string;
      hasFakeCaret: boolean;
      isActive: boolean;
    }>;
  }

  export const OTPInput: React.FC<OTPInputProps>;
  export const OTPInputContext: React.Context<OTPInputContextType>;
}

declare module '@/hooks/useAuth' {
  import { User } from '@/types';

  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
  }

  export function useAuth(): AuthContextType;
}

declare module '@/lib/api' {
  import { AxiosInstance } from 'axios';
  export const api: AxiosInstance;
}

declare module '@/components/prayer/PrayerRequestCard' {
  import { PrayerRequest } from '@/types';
  
  interface PrayerRequestCardProps {
    prayer: PrayerRequest;
    onPray?: () => void;
    onShare?: () => void;
    onAnswer?: () => void;
  }

  const PrayerRequestCard: React.FC<PrayerRequestCardProps>;
  export default PrayerRequestCard;
} 
