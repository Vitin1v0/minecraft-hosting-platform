require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de Segurança
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Importar rotas
const authRoutes = require('./routes/auth');
const planosRoutes = require('./routes/planos');
const servidoresRoutes = require('./routes/servidores');
const pagamentosRoutes = require('./routes/pagamentos');
const webhookRoutes = require('./routes/webhooks');
const usuariosRoutes = require('./routes/usuarios');

app.use('/api/auth', authRoutes);
app.use('/api/planos', planosRoutes);
app.use('/api/servidores', servidoresRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌎 Ambiente: ${process.env.NODE_ENV}`);
});
