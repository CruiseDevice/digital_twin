import apiService from '@/services/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthProps {
  onAuthChange: (isAuthenticated: boolean) => void;
}

export default function Auth({onAuthChange}: AuthProps) {
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await apiService.checkAuthStatus();
        setIsAuthenticated(authStatus);
        onAuthChange(authStatus);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        onAuthChange(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [onAuthChange]);

  const handleLogin = () => {
    try{
      const loginUrl = apiService.getLoginUrl();
      router.push(loginUrl);
    } catch (error) {
      // TODO: Handle error in the UI; maybe using a toast notification
      console.error('Login failed:', error);
    }
  }

  const handleLogout = () => {
    try{
      const logoutUrl = apiService.getLogoutUrl();
      router.push(logoutUrl);
    } catch(error) {
      console.error('Logout failed:', error);
      // TODO: Add error handling in the UI; maybe using a toast notification
    }
  }
  if (isLoading) {
    return <div className="flex justify-center p-4">Checking authentication status...</div>
  }
  return (
    <div className="flex justify-end p-4">
      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      ): (
        <button
          onClick={handleLogin}
          className='bg-blue-500 hover:bg-red-700 text-white text-white font-bold py-2 px-4 rounded'
        >
          Login with Gmail
        </button>
        )}
    </div>
  )
}