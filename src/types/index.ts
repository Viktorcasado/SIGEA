/**
 * Desenvolvido por Viktor Casado
 * Projeto SIGEA – Sistema Institucional
 * Definições TypeScript Globais
 */

export type UserType = 'ALUNO' | 'SERVIDOR' | 'PROFESSOR' | 'EXTERNO';
export type UserRole = 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN';

export interface Profile {
    id: string;
    nome_completo: string;
    email: string;
    cpf?: string;
    tipo_usuario: UserType;
    papel: UserRole;
    campus: string;
    foto_url?: string;
    updated_at: string;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    cover_image_url?: string;
    created_by: string;
    created_at: string;
}

export interface Registration {
    id: string;
    event_id: string;
    user_id: string;
    checked_in_at?: string;
    certificate_url?: string;
    created_at: string;
}
