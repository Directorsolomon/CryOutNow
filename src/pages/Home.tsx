
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to CryOutNow</h1>
      <p className="text-xl text-muted-foreground mb-8">Share and connect through prayer</p>
      {!user ? (
        <div className="space-x-4">
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button variant="outline" onClick={() => navigate('/register')}>Register</Button>
        </div>
      ) : (
        <Button onClick={() => navigate('/prayer-requests')}>View Prayer Requests</Button>
      )}
    </div>
  );
}
