-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(20),
  telefone VARCHAR(20),
  endereco TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco_mensal DECIMAL(10, 2) NOT NULL,
  preco_trimestral DECIMAL(10, 2),
  preco_anual DECIMAL(10, 2),
  slots_players INT NOT NULL,
  ram_gb INT NOT NULL,
  cpu_cores INT NOT NULL,
  ssd_gb INT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Adicionais
CREATE TABLE IF NOT EXISTS adicionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'slots', 'ram', 'backup', 'ip_extra', 'suporte'
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Servidores Contratados
CREATE TABLE IF NOT EXISTS servidores (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  plano_id INT REFERENCES planos(id),
  nome VARCHAR(255) NOT NULL,
  ip VARCHAR(45),
  porta INT,
  status VARCHAR(50) DEFAULT 'ativando', -- ativando, ativo, suspenso, deletado
  pterodactyl_server_id VARCHAR(50),
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_renovacao TIMESTAMP,
  data_vencimento TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Adicionais do Servidor
CREATE TABLE IF NOT EXISTS servidor_adicionais (
  id SERIAL PRIMARY KEY,
  servidor_id INT REFERENCES servidores(id) ON DELETE CASCADE,
  adicional_id INT REFERENCES adicionais(id),
  quantidade INT DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações/Faturas
CREATE TABLE IF NOT EXISTS transacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  servidor_id INT REFERENCES servidores(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL, -- 'compra', 'renovacao', 'upgrade'
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, aprovado, falhado, cancelado
  mercado_pago_id VARCHAR(255),
  mercado_pago_payment_id VARCHAR(255),
  metodo_pagamento VARCHAR(50), -- 'pix', 'credit_card', 'bank_transfer'
  external_reference VARCHAR(255),
  data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_vencimento TIMESTAMP,
  data_pagamento TIMESTAMP,
  detalhes JSONB
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_servidores_usuario ON servidores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_servidores_status ON servidores(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_mercado_pago ON transacoes(mercado_pago_payment_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servidores_updated_at
  BEFORE UPDATE ON servidores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
