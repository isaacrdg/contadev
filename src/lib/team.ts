/**
 * Equipe com acesso ao painel de redator.
 *
 * Pra adicionar alguém: coloca um novo objeto aqui e dá push.
 * Futuramente isso pode vir de um banco (Neon) e ter uma UI de
 * gerenciamento no admin. Por agora, hardcoded é suficiente.
 */

export interface TeamMember {
  id: string;
  name: string;
  role: "redator" | "revisor" | "editor" | "admin";
}

export const TEAM: TeamMember[] = [
  { id: "gabriel", name: "Gabriel", role: "admin" },
  { id: "isaac", name: "Isaac", role: "admin" },
];

/**
 * Retorna a lista de membros pra popular selects de autoria.
 */
export function getTeamMembers(): TeamMember[] {
  return TEAM;
}
