import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, DemoAccount } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginAsDemo: (role: 'recruiter' | 'candidate' | 'admin') => Promise<AuthUser>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: 'recruiter' | 'candidate' | 'admin';
    organization?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  demoAccounts: DemoAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'resume_matcher_auth_user';
const AUTH_TOKEN_KEY = 'resume_matcher_auth_token';

export const FALLBACK_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Sarah Jenkins',
    title: 'Lead Technical Recruiter',
    email: 'recruiter@resumematch.ai',
    password: 'recruiter123',
    role: 'recruiter',
    organization: 'Apex Talent Partners',
    badge: 'Recruiter Mode',
    description: 'Post jobs, batch upload resumes, inspect candidate match breakdown and explainability rankings.'
  },
  {
    name: 'Alex Rivera',
    title: 'Software Engineer Candidate',
    email: 'candidate@resumematch.ai',
    password: 'candidate123',
    role: 'candidate',
    organization: 'Independent Applicant',
    badge: 'Candidate Mode',
    description: 'Upload or paste your resume, inspect anonymized match scoring, and receive targeted 4-week learning roadmaps.'
  },
  {
    name: 'Dr. Elena Vance',
    title: 'AI Ethics & Compliance Officer',
    email: 'auditor@resumematch.ai',
    password: 'auditor123',
    role: 'admin',
    organization: 'AI Governance Board',
    badge: 'Auditor Mode',
    description: 'Audit scoring models, verify demographic attribute exclusion, and test counterfactual bias parity.'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>(FALLBACK_DEMO_ACCOUNTS);

  // Fetch updated demo accounts from backend on mount if available
  useEffect(() => {
    api.getDemoUsers()
      .then(accounts => {
        if (accounts && accounts.length > 0) {
          setDemoAccounts(accounts);
        }
      })
      .catch(() => {
        // Use fallback demo accounts if backend not yet ready
      });
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      const authUser: AuthUser = {
        ...res.user,
        token: res.token
      };
      setUser(authUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      return authUser;
    } catch (err: any) {
      // Fallback for offline demo accounts
      const fallback = FALLBACK_DEMO_ACCOUNTS.find(
        d => d.email.toLowerCase() === email.toLowerCase() && d.password === password
      );
      if (fallback) {
        const mockUser: AuthUser = {
          id: fallback.role === 'recruiter' ? 1 : fallback.role === 'candidate' ? 2 : 3,
          name: fallback.name,
          email: fallback.email,
          role: fallback.role,
          organization: fallback.organization,
          token: `mock_token_${Date.now()}`
        };
        setUser(mockUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
        return mockUser;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: 'recruiter' | 'candidate' | 'admin'): Promise<AuthUser> => {
    const demo = demoAccounts.find(a => a.role === role) || FALLBACK_DEMO_ACCOUNTS.find(a => a.role === role);
    if (!demo) {
      throw new Error(`Demo account for ${role} not found.`);
    }
    return login(demo.email, demo.password);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: 'recruiter' | 'candidate' | 'admin';
    organization?: string;
  }): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      const authUser: AuthUser = {
        ...res.user,
        token: res.token
      };
      setUser(authUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      return authUser;
    } catch (err: any) {
      // Fallback for offline mode if API call fails
      const mockUser: AuthUser = {
        id: Math.floor(Math.random() * 1000) + 10,
        name: payload.name,
        email: payload.email,
        role: payload.role || 'candidate',
        organization: payload.organization || '',
        token: `mock_reg_token_${Date.now()}`
      };
      setUser(mockUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        demoAccounts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
