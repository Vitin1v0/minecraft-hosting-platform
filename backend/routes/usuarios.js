const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

// Buscar perfil do usuário
router.get('/perfil', authenticateUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, nome, cpf_cnpj, telefone, endereco, criado_em
       FROM usuarios WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualizar perfil
router.put('/perfil', authenticateUser, async (req, res) => {
  try {
    const { nome, cpf_cnpj, telefone, endereco } = req.body;

    const result = await db.query(
      `UPDATE usuarios 
       SET nome = COALESCE($1, nome),
           cpf_cnpj = COALESCE($2, cpf_cnpj),
           telefone = COALESCE($3, telefone),
           endereco = COALESCE($4, endereco)
       WHERE id = $5
       RETURNING id, email, nome, cpf_cnpj, telefone, endereco`,
      [nome, cpf_cnpj, telefone, endereco, req.user.id]
    );

    res.json({ 
      message: 'Perfil atualizado com sucesso',
      usuario: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Alterar senha
router.put('/alterar-senha', authenticateUser, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'Senhas são obrigatórias' });
    }

    if (novaSenha.length < 8) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 8 caracteres' });
    }

    // Buscar senha atual
    const result = await db.query(
      'SELECT senha_hash FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, result.rows[0].senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await db.query(
      'UPDATE usuarios SET senha_hash = $1 WHERE id = $2',
      [novaSenhaHash, req.user.id]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// Deletar conta
router.delete('/deletar-conta', authenticateUser, async (req, res) => {
  try {
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ error: 'Senha é obrigatória para deletar conta' });
    }

    // Verificar senha
    const result = await db.query(
      'SELECT senha_hash FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, result.rows[0].senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Deletar conta (cascade deletará servidores e transações)
    await db.query('DELETE FROM usuarios WHERE id = $1', [req.user.id]);

    res.json({ message: 'Conta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
});

module.exports = router;
