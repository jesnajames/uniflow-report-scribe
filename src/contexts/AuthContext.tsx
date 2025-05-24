
import React, { createContext, useContext, useState, useEffect } from 'react';
import  User from '../types/user';


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const userData = await response.json();
    console.log("userData after login", userData);
    setUser(userData.user);
    localStorage.setItem('auth_user', JSON.stringify(userData.user));
    
    // Store auth token if provided
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await fetch(`${BASE_URL}/auth/create-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      console.log("response status", response.status);
      if (response.status == 409) {
        throw new Error('Email already exists');
      }
      throw new Error('Failed to create account');
    }

    const userData = await response.json();
    console.log("userData after signup", userData);
    setUser(userData.user);
    localStorage.setItem('auth_user', JSON.stringify(userData.user));
    
    // Store auth token if provided
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
