const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

// Registro
router.post('/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('confirmarSenha').custom((value, { req }) => {
      if (value !== req.body.senha) {
        throw new Error('As senhas não coincidem');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, senha, nome, cpf_cnpj, telefone, endereco } = req.body;

      // Verificar se usuário já existe
      const userExists = await db.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Inserir usuário
      const result = await db.query(
        `INSERT INTO usuarios (email, senha_hash, nome, cpf_cnpj, telefone, endereco)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, nome, criado_em`,
        [email, senhaHash, nome, cpf_cnpj || null, telefone || null, endereco || null]
      );

      const user = result.rows[0];

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, nome: user.nome },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          criadoEm: user.criado_em
        },
        token
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('senha').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, senha } = req.body;

      // Buscar usuário
      const result = await db.query(
        'SELECT id, email, nome, senha_hash, is_admin FROM usuarios WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = result.rows[0];

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          nome: user.nome,
          isAdmin: user.is_admin 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          isAdmin: user.is_admin
        },
        token
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
);

// Verificar Token
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, nome, cpf_cnpj, telefone, endereco, is_admin, criado_em 
       FROM usuarios WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

// Solicitar recuperação de senha (TODO: implementar envio de email)
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const { email } = req.body;

      const result = await db.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Por segurança, não informar se email existe ou não
        return res.json({ 
          message: 'Se o email estiver cadastrado, você receberá instruções para recuperação' 
        });
      }

      // TODO: Gerar token de recuperação e enviar email
      // const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // await sendPasswordResetEmail(email, resetToken);

      res.json({ 
        message: 'Se o email estiver cadastrado, você receberá instruções para recuperação' 
      });
    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error);
      res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }
);

module.exports = router;
