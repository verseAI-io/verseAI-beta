const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const bigqueryRoutes = require('./routes/bigquery');
const vertexAIRoutes = require('./routes/vertexai');
const geminiRoutes = require('./routes/gemini');
const sqlPlaygroundRoutes = require('./routes/sqlPlayground');
const neocortexRoutes = require('./routes/neocortex');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // React app
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'VerseAI API Server',
    version: '1.0.0',
    status: 'online',
    message: 'Welcome to VerseAI SQL Editor API',
    frontend: 'http://localhost:3000',
    endpoints: {
      health: '/health',
      bigquery: '/api/bigquery/*',
      vertexAI: '/api/ai/*',
      gemini: '/api/gemini/*',
      sqlPlayground: '/api/sql-playground/*'
    },
    documentation: {
      aiCodingChallenge: 'See AI_CODING_CHALLENGE_SETUP.md',
      sqlEditor: 'See SQL_EDITOR_README.md'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'VerseAI SQL Editor API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/bigquery', bigqueryRoutes);
app.use('/api/ai', vertexAIRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/sql-playground', sqlPlaygroundRoutes);
app.use('/api/neocortex', neocortexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════════╗
    ║   🚀 VerseAI SQL Editor API Server           ║
    ║   Powered by Google BigQuery & Vertex AI     ║
    ╠═══════════════════════════════════════════════╣
    ║   🌐 Server: http://localhost:${PORT}           ║
    ║   💚 Status: ONLINE                           ║
    ║   🔒 Security: Enabled                        ║
    ╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
