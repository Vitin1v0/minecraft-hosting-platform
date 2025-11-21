const nodemailer = require('nodemailer');

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar conexão
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro na configuração do email:', error);
  } else {
    console.log('✅ Servidor de email pronto');
  }
});

// Enviar email de confirmação de servidor
const enviarEmailConfirmacao = async (usuario, servidor, detalhes) => {
  try {
    const mailOptions = {
      from: `"Hugo Host" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: '✅ Seu Servidor Minecraft Está Pronto!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4CAF50;">Bem-vindo à Hugo Host!</h1>
          
          <p>Olá, <strong>${usuario.nome}</strong>!</p>
          
          <p>Seu servidor Minecraft foi configurado com sucesso e já está disponível para uso.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Detalhes do Servidor</h2>
            <p><strong>Nome:</strong> ${detalhes.nomeServidor}</p>
            <p><strong>IP:</strong> ${servidor.ip || 'Aguardando atribuição'}</p>
            <p><strong>Porta:</strong> ${servidor.porta || 'Aguardando atribuição'}</p>
            <p><strong>ID:</strong> ${servidor.identifier || servidor.id}</p>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Próximos Passos</h3>
            <ol>
              <li>Acesse o painel de controle em: <a href="${process.env.PTERODACTYL_URL}">${process.env.PTERODACTYL_URL}</a></li>
              <li>Use seu email (<strong>${usuario.email}</strong>) para fazer login</li>
              <li>Caso seja seu primeiro acesso, redefina sua senha através do painel</li>
              <li>Configure seu servidor e comece a jogar!</li>
            </ol>
          </div>
          
          <p>Se precisar de ajuda, nossa equipe de suporte está disponível para assistê-lo.</p>
          
          <p>Bom jogo!</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666;">
            Este é um email automático. Por favor, não responda.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

// Enviar email de renovação próxima
const enviarEmailRenovacao = async (usuario, servidor, diasRestantes) => {
  try {
    const mailOptions = {
      from: `"Hugo Host" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: `⏰ Renovação do Servidor: ${servidor.nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF9800;">Lembrete de Renovação</h1>
          
          <p>Olá, <strong>${usuario.nome}</strong>!</p>
          
          <p>Seu servidor <strong>${servidor.nome}</strong> vence em <strong>${diasRestantes} dias</strong>.</p>
          
          <p>Para garantir que seu servidor continue ativo, renove sua assinatura antes do vencimento.</p>
          
          <a href="${process.env.FRONTEND_URL}/servidores/${servidor.id}/renovar" 
             style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Renovar Agora
          </a>
          
          <p>Data de vencimento: <strong>${new Date(servidor.data_renovacao).toLocaleDateString('pt-BR')}</strong></p>
          
          <p>Obrigado por escolher a Hugo Host!</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de renovação enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erro ao enviar email de renovação:', error);
    throw error;
  }
};

module.exports = {
  enviarEmailConfirmacao,
  enviarEmailRenovacao
};
