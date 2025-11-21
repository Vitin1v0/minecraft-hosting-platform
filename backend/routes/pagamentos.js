const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const db = require('../config/database');
const { authenticateUser } = require('../middleware/auth');

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

// Calcular valor total do pedido
const calcularTotal = async (planoId, adicionaisIds, periodoMeses) => {
  // Buscar preço do plano
  const planoResult = await db.query(
    'SELECT preco_mensal, preco_trimestral, preco_anual FROM planos WHERE id = $1',
    [planoId]
  );

  if (planoResult.rows.length === 0) {
    throw new Error('Plano não encontrado');
  }

  const plano = planoResult.rows[0];
  let precoPlano = 0;

  // Determinar preço baseado no período
  if (periodoMeses === 12 && plano.preco_anual) {
    precoPlano = parseFloat(plano.preco_anual);
  } else if (periodoMeses === 3 && plano.preco_trimestral) {
    precoPlano = parseFloat(plano.preco_trimestral);
  } else {
    precoPlano = parseFloat(plano.preco_mensal) * periodoMeses;
  }

  // Adicionar preço dos adicionais
  let precoAdicionais = 0;
  if (adicionaisIds && adicionaisIds.length > 0) {
    const adicionaisResult = await db.query(
      'SELECT SUM(preco) as total FROM adicionais WHERE id = ANY($1)',
      [adicionaisIds]
    );
    precoAdicionais = parseFloat(adicionaisResult.rows[0]?.total || 0) * periodoMeses;
  }

  return precoPlano + precoAdicionais;
};

// Criar preferência de pagamento
router.post('/criar-pagamento', authenticateUser, async (req, res) => {
  try {
    const { planoId, adicionaisIds = [], periodoMeses = 1, nomeServidor } = req.body;

    // Validar entrada
    if (!planoId) {
      return res.status(400).json({ error: 'ID do plano é obrigatório' });
    }

    // Buscar dados do plano
    const planoResult = await db.query(
      'SELECT nome FROM planos WHERE id = $1 AND ativo = true',
      [planoId]
    );

    if (planoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    const planoNome = planoResult.rows[0].nome;

    // Calcular total
    const total = await calcularTotal(planoId, adicionaisIds, periodoMeses);

    // Gerar referência externa única
    const externalReference = `pedido-${req.user.id}-${Date.now()}`;

    // Criar preferência no Mercado Pago
    const preference = {
      items: [
        {
          title: `Servidor Minecraft - ${planoNome}`,
          description: `Hospedagem Minecraft - ${periodoMeses} ${periodoMeses === 1 ? 'mês' : 'meses'}`,
          quantity: 1,
          unit_price: total,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: req.user.nome,
        email: req.user.email
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
        pending: `${process.env.FRONTEND_URL}/pagamento/pendente`
      },
      external_reference: externalReference,
      notification_url: `${process.env.API_URL}/webhooks/mercado-pago`,
      auto_return: 'approved',
      statement_descriptor: 'MINECRAFT HOSTING',
      metadata: {
        usuario_id: req.user.id,
        plano_id: planoId,
        adicionais_ids: adicionaisIds.join(','),
        periodo_meses: periodoMeses,
        nome_servidor: nomeServidor || `Servidor-${req.user.nome}`
      }
    };

    const result = await mercadopago.preferences.create(preference);

    // Registrar transação pendente no banco
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3); // 3 dias para pagar

    await db.query(
      `INSERT INTO transacoes 
       (usuario_id, tipo, valor, status, external_reference, data_vencimento, detalhes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.user.id,
        'compra',
        total,
        'pendente',
        externalReference,
        dataVencimento,
        JSON.stringify({ planoId, adicionaisIds, periodoMeses, nomeServidor })
      ]
    );

    res.json({
      init_point: result.body.init_point,
      preference_id: result.body.id,
      external_reference: externalReference
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// Listar transações do usuário
router.get('/minhas-transacoes', authenticateUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, s.nome as servidor_nome
       FROM transacoes t
       LEFT JOIN servidores s ON t.servidor_id = s.id
       WHERE t.usuario_id = $1
       ORDER BY t.data_transacao DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ transacoes: result.rows });
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Buscar detalhes de uma transação
router.get('/transacao/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM transacoes 
       WHERE id = $1 AND usuario_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ transacao: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
});

module.exports = router;
