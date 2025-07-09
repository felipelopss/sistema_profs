import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários do sistema com dados completos (admin padrão)
const systemUsers: User[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'admin@escola.com',
    role: 'admin',
    phone: '(11) 99999-0001',
    registrationNumber: 'ADM001',
    password: '123456',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('sighe_current_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('sighe_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar primeiro nos usuários do sistema (admin)
      let foundUser = systemUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Se não encontrou, buscar nos professores cadastrados no Supabase
      if (!foundUser) {
        const { data: teachers, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .eq('role', 'teacher')
          .single();

        if (!error && teachers) {
          foundUser = {
            id: teachers.id,
            name: teachers.name,
            email: teachers.email,
            role: teachers.role,
            registrationNumber: teachers.registration_number,
            phone: teachers.phone,
            subjects: teachers.subjects || [],
            password: teachers.password_hash,
            createdAt: new Date(teachers.created_at),
            updatedAt: new Date(teachers.updated_at)
          };
        }
      }
      
      // Verificar credenciais
      if (foundUser && (foundUser.password === password || (!foundUser.password && password === '123456'))) {
        const userWithTimestamp = {
          ...foundUser,
          lastLogin: new Date()
        };
        
        setUser(userWithTimestamp);
        localStorage.setItem('sighe_current_user', JSON.stringify(userWithTimestamp));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sighe_current_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...data,
        updatedAt: new Date()
      };
      setUser(updatedUser);
      localStorage.setItem('sighe_current_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateProfile, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}