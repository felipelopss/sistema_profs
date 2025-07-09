import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários do sistema com dados completos
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
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@escola.com',
    role: 'teacher',
    registrationNumber: 'PROF001',
    phone: '(11) 99999-0002',
    subjects: ['1', '2'], // IDs das disciplinas que leciona
    password: '123456',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana.costa@escola.com',
    role: 'teacher',
    registrationNumber: 'PROF002',
    phone: '(11) 99999-0003',
    subjects: ['3', '4'],
    password: '123456',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@escola.com',
    role: 'teacher',
    registrationNumber: 'PROF003',
    phone: '(11) 99999-0004',
    subjects: ['5', '6'],
    password: '123456',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@escola.com',
    role: 'teacher',
    registrationNumber: 'PROF004',
    phone: '(11) 99999-0005',
    subjects: ['7', '8'],
    password: '123456',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date()
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<User[]>([]);

  // Carregar professores cadastrados do localStorage
  useEffect(() => {
    const loadTeachers = () => {
      try {
        const savedTeachers = localStorage.getItem('sighe_teachers');
        if (savedTeachers) {
          const parsedTeachers = JSON.parse(savedTeachers, (key, value) => {
            if (value && typeof value === 'object' && value.__type === 'Date') {
              return new Date(value.value);
            }
            return value;
          });
          setTeachers(parsedTeachers);
        }
      } catch (error) {
        console.error('Erro ao carregar professores:', error);
      }
    };

    loadTeachers();
    
    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      loadTeachers();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar mudanças periodicamente (para mudanças na mesma aba)
    const interval = setInterval(loadTeachers, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
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
    
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buscar primeiro nos usuários do sistema (admin e professores padrão)
    let foundUser = systemUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Se não encontrou, buscar nos professores cadastrados
    if (!foundUser) {
      foundUser = teachers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.role === 'teacher'
      );
    }
    
    // Verificar credenciais
    if (foundUser && ((foundUser as any).password === password || (!foundUser.password && password === '123456'))) {
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