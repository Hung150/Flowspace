import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  register: (email: string, password: string, name: string) => Promise<void>;
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

// Main component - chỉ export default này
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('flowspace_user');
      const token = localStorage.getItem('flowspace_token');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Wrap setState trong requestAnimationFrame để tránh warning
          requestAnimationFrame(() => {
            setUser(parsedUser);
          });
        } catch {
          console.error('Failed to parse user');
        }
      }
      
      requestAnimationFrame(() => {
        setIsLoading(false);
      });
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', email, password);
    
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
    
    return Promise.resolve();
  };

  const register = async (email: string, password: string, name: string) => {
    console.log('Register:', { email, name });
    return Promise.resolve();
  };

  const logout = () => {
    localStorage.removeItem('flowspace_user');
    localStorage.removeItem('flowspace_token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const updatedUser = { ...user, ...data };
    localStorage.setItem('flowspace_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    return Promise.resolve();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    console.log('Change password:', { currentPassword, newPassword });
    return Promise.resolve();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// CHỈ EXPORT DEFAULT
export default AuthProvider;
