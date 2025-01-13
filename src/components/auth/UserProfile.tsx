/**
 * @file UserProfile.tsx
 * @description Component for displaying user profile information
 */

import { useEffect, useState } from 'react';
import { getUserProfile, UserProfile } from '../../services/firebase';

/**
 * Props for the UserProfileViewer component
 * @interface UserProfileViewerProps
 */
interface UserProfileViewerProps {
  /** The unique identifier of the user whose profile to display */
  userId: string;
}

/**
 * UserProfileViewer Component
 * @component
 * @description Displays a user's profile information fetched from Firebase
 * @param {UserProfileViewerProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function UserProfileViewer({ userId }: UserProfileViewerProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetches the user profile data
     * @async
     * @function fetchProfile
     */
    const fetchProfile = async () => {
      try {
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">User Profile</h2>
      <div className="space-y-2">
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Display Name:</strong> {profile.displayName || 'Not set'}</p>
        <p><strong>Created:</strong> {profile.createdAt.toLocaleString()}</p>
        {profile.photoURL && (
          <div>
            <strong>Profile Picture:</strong>
            <img 
              src={profile.photoURL} 
              alt="Profile" 
              className="w-20 h-20 rounded-full mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
} 
