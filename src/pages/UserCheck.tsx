import { UserProfileViewer } from '../components/auth/UserProfile';

export default function UserCheck() {
  const userId = 'syCfmuPGbbOb9Zt3vtxzQ926yj93';

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">User Data Check</h1>
      <UserProfileViewer userId={userId} />
    </div>
  );
} 
