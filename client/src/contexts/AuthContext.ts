import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User type (cập nhật từ types của bạn)
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  position?: string;
  bio?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ localStorage khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem('flowspace_user');
    const token = localStorage.getItem('flowspace_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Gọi API login thực tế
    const mockUser: User = {
      id: '1',
      email,
      name: 'Luong Duc Hung',
      avatar: 'https://ui-avatars.com/api/?name=Luong+Duc+Hung&background=4f46e5&color=fff',
      position: 'Project Manager',
      bio: 'Working on FlowSpace project management',
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('flowspace_user', JSON.stringify(mockUser));
    localStorage.setItem('flowspace_token', 'mock-token-123');
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('flowspace_user');
    localStorage.removeItem('flowspace_token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    
    // TODO: Gọi API update profile
    localStorage.setItem('flowspace_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // TODO: Gọi API change password
    console.log('Changing password...', { currentPassword, newPassword });
    throw new Error('Not implemented yet');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
