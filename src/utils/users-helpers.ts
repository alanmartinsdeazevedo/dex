/**
 * 🎯 Utilitário: Formata tempo relativo (ex: "2 dias atrás")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 30) {
    return targetDate.toLocaleDateString('pt-BR');
  } else if (diffDays > 0) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora';
  }
}

/**
 * 🎨 Utilitário: Determina cor do badge baseado no status
 */
export function getUserStatusColor(isActive: boolean): {
  color: 'green' | 'red';
  text: string;
} {
  return isActive 
    ? { color: 'green', text: 'Ativo' }
    : { color: 'red', text: 'Inativo' };
}