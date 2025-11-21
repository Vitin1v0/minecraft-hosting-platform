const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Listar todos os planos ativos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nome, descricao, preco_mensal, preco_trimestral, preco_anual,
              slots_players, ram_gb, cpu_cores, ssd_gb, destaque
       FROM planos
       WHERE ativo = true
       ORDER BY preco_mensal ASC`
    );

    res.json({ planos: result.rows });
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
});

// Buscar plano específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM planos WHERE id = $1 AND ativo = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    res.json({ plano: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({ error: 'Erro ao buscar plano' });
  }
});

// Listar adicionais disponíveis
router.get('/adicionais/list', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nome, descricao, preco, tipo
       FROM adicionais
       WHERE ativo = true
       ORDER BY tipo, preco ASC`
    );

    res.json({ adicionais: result.rows });
  } catch (error) {
    console.error('Erro ao listar adicionais:', error);
    res.status(500).json({ error: 'Erro ao buscar adicionais' });
  }
});

// [ADMIN] Criar novo plano
router.post('/', authenticateUser, isAdmin, async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco_mensal,
      preco_trimestral,
      preco_anual,
      slots_players,
      ram_gb,
      cpu_cores,
      ssd_gb,
      destaque
    } = req.body;

    const result = await db.query(
      `INSERT INTO planos 
       (nome, descricao, preco_mensal, preco_trimestral, preco_anual, 
        slots_players, ram_gb, cpu_cores, ssd_gb, destaque)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        nome,
        descricao,
        preco_mensal,
        preco_trimestral,
        preco_anual,
        slots_players,
        ram_gb,
        cpu_cores,
        ssd_gb,
        destaque || false
      ]
    );

    res.status(201).json({ 
      message: 'Plano criado com sucesso', 
      plano: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ error: 'Erro ao criar plano' });
  }
});

// [ADMIN] Atualizar plano
router.put('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    Object.keys(campos).forEach(key => {
      if (campos[key] !== undefined) {
        setClauses.push(`${key} = $${paramCount}`);
        values.push(campos[key]);
        paramCount++;
      }
    });

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);

    const query = `
      UPDATE planos 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    res.json({ 
      message: 'Plano atualizado com sucesso', 
      plano: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
});

// [ADMIN] Desativar plano
router.delete('/:id', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE planos SET ativo = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    res.json({ message: 'Plano desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar plano:', error);
    res.status(500).json({ error: 'Erro ao desativar plano' });
  }
});

module.exports = router;
