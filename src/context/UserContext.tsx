'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Tipos para o contexto
interface UserRole {
  id: string;
  role: string;
  description: string;
}

interface UserContextType {
  user: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isCollaborator: () => boolean;
  canAccessAdmin: () => boolean;
}

// Criar o contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider do contexto
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      });
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [session, status]);

  // Função para verificar se usuário tem uma role específica
  const hasRole = (role: string): boolean => {
    if (!user?.role) return false;
    return user.role.toLowerCase() === role.toLowerCase();
  };

  // Função para verificar se usuário tem qualquer uma das roles
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.role) return false;
    return roles.some(role => hasRole(role));
  };

  // Funções específicas para cada role
  const isAdmin = (): boolean => hasRole('Administrador');
  const isManager = (): boolean => hasRole('Gerente');
  const isCollaborator = (): boolean => hasRole('Colaborador');

  // Função para verificar se pode acessar área administrativa
  const canAccessAdmin = (): boolean => {
    return hasAnyRole(['Administrador', 'Gerente']);
  };

  const contextValue: UserContextType = {
    user,
    isLoading: status === 'loading' || isLoading,
    isAuthenticated: !!session && !!user,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isCollaborator,
    canAccessAdmin,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}

// Hook para proteção de rotas
export function useAuthGuard() {
  const { user, isLoading, isAuthenticated } = useUser();
  
  return {
    user,
    isLoading,
    isAuthenticated,
    requireAuth: () => {
      if (!isLoading && !isAuthenticated) {
        throw new Error('Usuário não autenticado');
      }
    },
    requireRole: (role: string) => {
      if (!isLoading && (!isAuthenticated || !user?.role || user.role !== role)) {
        throw new Error(`Acesso negado. Role necessária: ${role}`);
      }
    },
    requireAnyRole: (roles: string[]) => {
      if (!isLoading && (!isAuthenticated || !user?.role || !roles.includes(user.role))) {
        throw new Error(`Acesso negado. Roles necessárias: ${roles.join(', ')}`);
      }
    },
  };
}