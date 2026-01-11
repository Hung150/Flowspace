import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('flowspace_user');
    
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        console.error('Failed to parse user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - replace with real API
    const mockUser: User = {
      id: '1',
      email,
      name: 'Luong Duc Hung',
      avatar: 'https://ui-avatars.com/api/?name=Luong+Duc+Hung&background=4f46e5&color=fff',
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('flowspace_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return Promise.resolve();
  };

  const logout = () => {
    localStorage.removeItem('flowspace_user');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const updatedUser: User = { ...user, ...data };
    localStorage.setItem('flowspace_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return Promise.resolve();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Mock implementation
    console.log('Changing password...');
    return Promise.resolve();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
