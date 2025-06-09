// ============================================
// CONSTANTES DE ROLES DO SISTEMA DEX
// ============================================

export const SYSTEM_ROLES = [
  {
    id: '49ccdc5f-5cfb-4e0a-8078-ef96a03786d6',
    role: 'Administrador',
    description: 'Usuário com permissões totais no sistema'
  },
  {
    id: '2d454b62-3f6f-4f9b-a64d-2d7334aa407d', 
    role: 'Service Desk',
    description: 'Responsável por atender chamados e solucionar problemas'
  },
  {
    id: '4ea4dc7e-eb9e-45fe-9ac8-eae40d775382',
    role: 'Supervisor', 
    description: 'Responsável por supervisionar equipes e processos'
  },
  {
    id: 'e2aed363-da5a-40d1-a614-c20fbb16f89e',
    role: 'Helper', 
    description: 'Auxilia em tarefas operacionais'
  },
  {
    id: '8326745b-7ccc-44b8-89d6-1415bac39f19',
    role: 'Colaborador', 
    description: 'Usuário comum do sistema'
  }
];

// Função para buscar roles (pode ser substituída por uma API call futuramente)
export function getAvailableRoles() {
  return SYSTEM_ROLES;
}

// Função para buscar role por ID
export function getRoleById(roleId: string) {
  return SYSTEM_ROLES.find(role => role.id === roleId);
}

// Função para buscar role por nome
export function getRoleByName(roleName: string) {
  return SYSTEM_ROLES.find(role => role.role === roleName);
}