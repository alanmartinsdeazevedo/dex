'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/src/context/UserContext';
import Loading from './loading';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  requireAnyRole?: string[];
  fallbackRoute?: string;
  showLoading?: boolean;
}

export default function RouteGuard({
  children,
  requireAuth = false,
  requireRole,
  requireAnyRole,
  fallbackRoute = '/',
  showLoading = true,
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated, hasRole, hasAnyRole } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Aguardar carregamento
    if (isLoading) return;

    // Verificar autenticação
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackRoute);
      return;
    }

    // Verificar role específica
    if (requireRole && !hasRole(requireRole)) {
      router.push(fallbackRoute);
      return;
    }

    // Verificar qualquer uma das roles
    if (requireAnyRole && !hasAnyRole(requireAnyRole)) {
      router.push(fallbackRoute);
      return;
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireRole, requireAnyRole, router, fallbackRoute, hasRole, hasAnyRole]);

  // Mostrar loading enquanto verifica
  if (isLoading && showLoading) {
    return <Loading />;
  }

  // Verificações de acesso
  if (requireAuth && !isAuthenticated) {
    return null; // Redirecionamento em andamento
  }

  if (requireRole && !hasRole(requireRole)) {
    return null; // Redirecionamento em andamento
  }

  if (requireAnyRole && !hasAnyRole(requireAnyRole)) {
    return null; // Redirecionamento em andamento
  }

  return <>{children}</>;
}

// Componente específico para área administrativa
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard
      requireAuth={true}
      requireAnyRole={['Administrador', 'Gerente']}
      fallbackRoute="/dashboard"
    >
      {children}
    </RouteGuard>
  );
}

// Componente para mostrar conteúdo baseado em permissões
interface PermissionGateProps {
  children: React.ReactNode;
  requireRole?: string;
  requireAnyRole?: string[];
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  requireRole,
  requireAnyRole,
  fallback = null,
}: PermissionGateProps) {
  const { hasRole, hasAnyRole, isLoading } = useUser();

  // Aguardar carregamento
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Verificar permissões
  if (requireRole && !hasRole(requireRole)) {
    return <>{fallback}</>;
  }

  if (requireAnyRole && !hasAnyRole(requireAnyRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}