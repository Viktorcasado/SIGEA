-- Arquitetura de Banco de Dados - SIGEA
-- Desenvolvido por Viktor Casado
-- Sistema Institucional de Gestão de Eventos Acadêmicos

-- [1] Configurações Iniciais
SET timezone = 'America/Maceio';

-- [2] Enumerações (Tipos Fixos)
CREATE TYPE tipo_usuario AS ENUM ('ALUNO', 'SERVIDOR', 'PROFESSOR', 'COMUNIDADE_EXTERNA');
CREATE TYPE status_evento AS ENUM ('RASCUNHO', 'PUBLICADO', 'CANCELADO', 'ENCERRADO');
CREATE TYPE tipo_certificado AS ENUM ('PARTICIPANTE', 'PALESTRANTE', 'ORGANIZADOR', 'VISITANTE', 'MONITOR');

-- [3] Tabela de Campi (IFAL)
CREATE TABLE public.campi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    cidade TEXT NOT NULL,
    sigla TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserção de dados padrão (Campi do IFAL)
INSERT INTO public.campi (nome, cidade, sigla) VALUES
('Campus Maceió', 'Maceió', 'MAC'),
('Campus Arapiraca', 'Arapiraca', 'ARA'),
('Campus Palmeira dos Índios', 'Palmeira dos Índios', 'PIN'),
('Campus Satuba', 'Satuba', 'SAT'),
('Campus Marechal Deodoro', 'Marechal Deodoro', 'MAL'),
('Campus Penedo', 'Penedo', 'PEN'),
('Campus Rio Largo', 'Rio Largo', 'RLA'),
('Campus Santana do Ipanema', 'Santana do Ipanema', 'SAN'),
('Campus São Miguel dos Campos', 'São Miguel dos Campos', 'SMC'),
('Campus Viçosa', 'Viçosa', 'VIC'),
('Campus Coruripe', 'Coruripe', 'COR'),
('Campus Murici', 'Murici', 'MUR'),
('Campus Piranhas', 'Piranhas', 'PIR'),
('Campus Maragogi', 'Maragogi', 'MAR'),
('Campus Batalha', 'Batalha', 'BAT'),
('Campus Benedito Bentes', 'Maceió', 'BEN');

-- [4] Tabela de Perfis (Extensão de auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    cpf TEXT UNIQUE,
    matricula TEXT,
    tipo_vinculo tipo_usuario DEFAULT 'COMUNIDADE_EXTERNA',
    campus_id UUID REFERENCES public.campi(id),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [5] Tabela de Eventos
CREATE TABLE public.eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    banner_url TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    local TEXT NOT NULL,
    campus_id UUID REFERENCES public.campi(id),
    organizador_id UUID REFERENCES public.profiles(id),
    status status_evento DEFAULT 'RASCUNHO',
    carga_horaria INTEGER DEFAULT 4,
    vagas_totais INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [6] Tabela de Inscrições
CREATE TABLE public.inscricoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in BOOLEAN DEFAULT FALSE,
    data_check_in TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(evento_id, user_id)
);

-- [7] Tabela de Certificados
CREATE TABLE public.certificados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inscricao_id UUID REFERENCES public.inscricoes(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id),
    evento_id UUID REFERENCES public.eventos(id),
    codigo_validacao TEXT UNIQUE NOT NULL, -- Hash único para validação pública
    tipo tipo_certificado DEFAULT 'PARTICIPANTE',
    texto_conteudo TEXT NOT NULL, -- Texto gerado estático para histórico
    emitido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [8] Tabela de Logs Institucionais
CREATE TABLE public.logs_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    acao TEXT NOT NULL,
    detalhes JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [9] Triggers e Funções

-- Função para sincronizar automaticamente Usuário Auth -> Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, tipo_vinculo)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE((new.raw_user_meta_data->>'tipo_vinculo')::tipo_usuario, 'COMUNIDADE_EXTERNA')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de criação de usuário
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- [10] Políticas de Segurança (RLS - Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Exemplo: Perfis são visíveis por todos (para listas de presença) mas editáveis apenas pelo dono
CREATE POLICY "Perfis visíveis publicamente" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Exemplo: Eventos visíveis para todos
CREATE POLICY "Eventos públicos" ON public.eventos FOR SELECT USING (true);

-- Exemplo: Inscrições apenas visíveis pelo usuário ou admins (Admins precisariam de role management mais complexo, simplificado aqui)
CREATE POLICY "Ver próprias inscrições" ON public.inscricoes FOR SELECT USING (auth.uid() = user_id);

-- [FIM DO ARQUIVO]
