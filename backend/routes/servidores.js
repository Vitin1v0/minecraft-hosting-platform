const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { 
  buscarStatusServidor, 
  suspenderServidor, 
  reativarServidor, 
  deletarServidor 
} = require('../services/pterodactyl');

// Listar servidores do usuário
router.get('/meus-servidores', authenticateUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, p.nome as plano_nome, p.ram_gb, p.cpu_cores, p.ssd_gb, p.slots_players
       FROM servidores s
       JOIN planos p ON s.plano_id = p.id
       WHERE s.usuario_id = $1 AND s.status != 'deletado'
       ORDER BY s.criado_em DESC`,
      [req.user.id]
    );

    res.json({ servidores: result.rows });
  } catch (error) {
    console.error('Erro ao listar servidores:', error);
    res.status(500).json({ error: 'Erro ao buscar servidores' });
  }
});

// Buscar servidor específico
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT s.*, p.nome as plano_nome, p.ram_gb, p.cpu_cores, p.ssd_gb
       FROM servidores s
       JOIN planos p ON s.plano_id = p.id
       WHERE s.id = $1 AND s.usuario_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    const servidor = result.rows[0];

    // Buscar status atual do Pterodactyl
    if (servidor.pterodactyl_server_id) {
      try {
        const statusPterodactyl = await buscarStatusServidor(servidor.pterodactyl_server_id);
        servidor.status_pterodactyl = statusPterodactyl;
      } catch (error) {
        console.error('Erro ao buscar status do Pterodactyl:', error);
      }
    }

    res.json({ servidor });
  } catch (error) {
    console.error('Erro ao buscar servidor:', error);
    res.status(500).json({ error: 'Erro ao buscar servidor' });
  }
});

// Atualizar nome do servidor
router.put('/:id/renomear', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({ error: 'Nome inválido' });
    }

    const result = await db.query(
      `UPDATE servidores 
       SET nome = $1 
       WHERE id = $2 AND usuario_id = $3
       RETURNING *`,
      [nome.trim(), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    res.json({ 
      message: 'Servidor renomeado com sucesso', 
      servidor: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao renomear servidor:', error);
    res.status(500).json({ error: 'Erro ao renomear servidor' });
  }
});

// Suspender servidor
router.post('/:id/suspender', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM servidores WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    const servidor = result.rows[0];

    // Suspender no Pterodactyl
    if (servidor.pterodactyl_server_id) {
      await suspenderServidor(servidor.pterodactyl_server_id);
    }

    // Atualizar status no banco
    await db.query(
      'UPDATE servidores SET status = $1 WHERE id = $2',
      ['suspenso', id]
    );

    res.json({ message: 'Servidor suspenso com sucesso' });
  } catch (error) {
    console.error('Erro ao suspender servidor:', error);
    res.status(500).json({ error: 'Erro ao suspender servidor' });
  }
});

// Reativar servidor
router.post('/:id/reativar', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM servidores WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    const servidor = result.rows[0];

    // Reativar no Pterodactyl
    if (servidor.pterodactyl_server_id) {
      await reativarServidor(servidor.pterodactyl_server_id);
    }

    // Atualizar status no banco
    await db.query(
      'UPDATE servidores SET status = $1 WHERE id = $2',
      ['ativo', id]
    );

    res.json({ message: 'Servidor reativado com sucesso' });
  } catch (error) {
    console.error('Erro ao reativar servidor:', error);
    res.status(500).json({ error: 'Erro ao reativar servidor' });
  }
});

// Deletar servidor
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM servidores WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    const servidor = result.rows[0];

    // Deletar no Pterodactyl
    if (servidor.pterodactyl_server_id) {
      try {
        await deletarServidor(servidor.pterodactyl_server_id);
      } catch (error) {
        console.error('Erro ao deletar no Pterodactyl:', error);
      }
    }

    // Marcar como deletado no banco
    await db.query(
      'UPDATE servidores SET status = $1 WHERE id = $2',
      ['deletado', id]
    );

    res.json({ message: 'Servidor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar servidor:', error);
    res.status(500).json({ error: 'Erro ao deletar servidor' });
  }
});

// Buscar adicionais do servidor
router.get('/:id/adicionais', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar propriedade do servidor
    const servidorResult = await db.query(
      'SELECT id FROM servidores WHERE id = $1 AND usuario_id = $2',
      [id, req.user.id]
    );

    if (servidorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    const result = await db.query(
      `SELECT sa.*, a.nome, a.descricao, a.preco, a.tipo
       FROM servidor_adicionais sa
       JOIN adicionais a ON sa.adicional_id = a.id
       WHERE sa.servidor_id = $1`,
      [id]
    );

    res.json({ adicionais: result.rows });
  } catch (error) {
    console.error('Erro ao buscar adicionais:', error);
    res.status(500).json({ error: 'Erro ao buscar adicionais' });
  }
});

module.exports = router;
