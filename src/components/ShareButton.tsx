import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Mail, Copy, MessageCircle } from 'lucide-react';
import { shareToSocialMedia } from '@/utils/sharing';
import { toast } from '@/components/ui/use-toast';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareButton({ title, text, url, variant = 'outline', size = 'icon' }: ShareButtonProps) {
  const handleShare = async (platform?: string) => {
    const success = await shareToSocialMedia({ title, text, url }, platform);
    
    if (success) {
      if (!platform) {
        toast({
          title: 'Copied to clipboard',
          description: 'The link has been copied to your clipboard.',
        });
      } else {
        toast({
          title: 'Sharing',
          description: `Opening ${platform} to share...`,
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to share. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="mr-2 h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="mr-2 h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="mr-2 h-4 w-4" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare()}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
