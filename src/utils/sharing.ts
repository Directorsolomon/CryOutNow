interface ShareData {
  title: string;
  text: string;
  url: string;
}

export const shareToSocialMedia = async (data: ShareData, platform?: string) => {
  const encodedText = encodeURIComponent(data.text);
  const encodedUrl = encodeURIComponent(data.url);
  const encodedTitle = encodeURIComponent(data.title);

  // Check if Web Share API is available
  if (navigator.share && !platform) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  // Platform-specific sharing
  let shareUrl = '';
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      break;
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`;
      break;
    default:
      // Copy to clipboard if no platform is specified and Web Share API is not available
      try {
        await navigator.clipboard.writeText(`${data.text} ${data.url}`);
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
      }
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
}; 
