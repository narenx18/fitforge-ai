import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, CharacterClass } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  authUser: AuthUser | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, characterClass: CharacterClass) => Promise<{ success: boolean; error?: string }>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateCharacterClass: (cls: CharacterClass) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const stored = await storageService.loadAuthUser();
        if (stored) setAuthUser(stored);
      } catch (e) {
        console.warn('Auth session load error:', e);
      } finally {
        setIsAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string, name?: string) => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Email and password are required.' };
    }
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      name: name || email.split('@')[0],
      token: `token_${Date.now()}`,
    };
    setAuthUser(user);
    await storageService.saveAuthUser(user);
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string, characterClass: CharacterClass) => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      return { success: false, error: 'All fields are required.' };
    }
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      token: `token_${Date.now()}`,
    };
    setAuthUser(user);
    await storageService.saveAuthUser(user);
    return { success: true };
  };

  const guestLogin = async () => {
    const guestUser: AuthUser = {
      id: 'usr_guest',
      email: 'guest@fitforge.ai',
      name: 'Cyber Athlete',
      token: 'guest_token',
    };
    setAuthUser(guestUser);
    await storageService.saveAuthUser(guestUser);
  };

  const logout = async () => {
    setAuthUser(null);
    await storageService.clearAuthUser();
  };

  const updateCharacterClass = async (cls: CharacterClass) => {
    // Session state preserved for navigation context
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        isAuthLoading,
        isAuthenticated: !!authUser,
        login,
        signup,
        guestLogin,
        logout,
        updateCharacterClass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};