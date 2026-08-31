const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const env = require('./config/env');
const { globalLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const syncRoutes = require('./routes/syncRoutes');
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

const app = express();

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: env.cors.origin,
    credentials: true,
  })
);

// Body parser with rawBody capture (needed for HMAC)
app.use(
  express.json({
    limit: '5mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cookieParser());
app.use(globalLimiter);

// Health
app.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));

// Routes
app.use('/api/v1', syncRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', candidateRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;