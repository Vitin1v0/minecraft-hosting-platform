const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const db = require('../config/database');
const { provisionarServidor } = require('../services/pterodactyl');
const { enviarEmailConfirmacao } = require('../services/email');

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

// Webhook do Mercado Pago
router.post('/mercado-pago', async (req, res) => {
  try {
    const { type, data } = req.body;

    // Responder imediatamente ao Mercado Pago
    res.status(200).json({ success: true });

    // Processar apenas notificações de pagamento
    if (type !== 'payment') {
      console.log('Tipo de notificação ignorado:', type);
      return;
    }

    const paymentId = data.id;

    if (!paymentId) {
      console.error('ID de pagamento inválido');
      return;
    }

    // Buscar detalhes do pagamento
    const payment = await mercadopago.payment.findById(paymentId);
    const paymentData = payment.body;

    console.log('Pagamento recebido:', {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference
    });

    // Atualizar status da transação
    await db.query(
      `UPDATE transacoes 
       SET status = $1, 
           mercado_pago_payment_id = $2,
           metodo_pagamento = $3,
           data_pagamento = $4
       WHERE external_reference = $5`,
      [
        paymentData.status,
        paymentData.id,
        paymentData.payment_type_id,
        paymentData.date_approved || new Date(),
        paymentData.external_reference
      ]
    );

    // Se pagamento aprovado, provisionar servidor
    if (paymentData.status === 'approved') {
      console.log('✅ Pagamento aprovado! Provisionando servidor...');

      // Buscar transação
      const transacaoResult = await db.query(
        'SELECT * FROM transacoes WHERE external_reference = $1',
        [paymentData.external_reference]
      );

      if (transacaoResult.rows.length === 0) {
        console.error('Transação não encontrada:', paymentData.external_reference);
        return;
      }

      const transacao = transacaoResult.rows[0];
      const detalhes = transacao.detalhes;

      // Buscar dados do usuário
      const usuarioResult = await db.query(
        'SELECT * FROM usuarios WHERE id = $1',
        [transacao.usuario_id]
      );

      if (usuarioResult.rows.length === 0) {
        console.error('Usuário não encontrado:', transacao.usuario_id);
        return;
      }

      const usuario = usuarioResult.rows[0];

      try {
        // Provisionar servidor no Pterodactyl
        const servidor = await provisionarServidor(
          usuario,
          detalhes.planoId,
          detalhes.nomeServidor,
          detalhes.periodoMeses
        );

        // Registrar servidor no banco
        const dataRenovacao = new Date();
        dataRenovacao.setMonth(dataRenovacao.getMonth() + detalhes.periodoMeses);

        const servidorResult = await db.query(
          `INSERT INTO servidores 
           (usuario_id, plano_id, nome, ip, porta, status, pterodactyl_server_id, data_renovacao)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            usuario.id,
            detalhes.planoId,
            detalhes.nomeServidor,
            servidor.ip || null,
            servidor.porta || null,
            'ativo',
            servidor.id,
            dataRenovacao
          ]
        );

        const servidorId = servidorResult.rows[0].id;

        // Associar adicionais ao servidor
        if (detalhes.adicionaisIds && detalhes.adicionaisIds.length > 0) {
          for (const adicionalId of detalhes.adicionaisIds) {
            await db.query(
              'INSERT INTO servidor_adicionais (servidor_id, adicional_id) VALUES ($1, $2)',
              [servidorId, adicionalId]
            );
          }
        }

        // Atualizar transação com servidor_id
        await db.query(
          'UPDATE transacoes SET servidor_id = $1 WHERE id = $2',
          [servidorId, transacao.id]
        );

        // Enviar email de confirmação
        await enviarEmailConfirmacao(usuario, servidor, detalhes);

        console.log('✅ Servidor provisionado com sucesso:', servidor.id);
      } catch (error) {
        console.error('❌ Erro ao provisionar servidor:', error);
        
        // Atualizar status da transação para erro
        await db.query(
          `UPDATE transacoes 
           SET status = $1 
           WHERE id = $2`,
          ['erro_provisionamento', transacao.id]
        );
      }
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
  }
});

module.exports = router;
