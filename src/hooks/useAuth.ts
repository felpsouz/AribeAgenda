import { useCallback } from 'react';
import { auth } from '@/firebase/config';

export const useAuth = () => {
  const handleLogout = useCallback(async (): Promise<boolean> => {
    try {
      await auth.signOut();
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
    }
  }, []);

  return { handleLogout };
};