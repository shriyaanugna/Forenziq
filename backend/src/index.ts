import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import casesRouter from './routes/cases.js';
import evidenceRouter from './routes/evidence.js';
import findingsRouter from './routes/findings.js';
import dashboardRouter from './routes/dashboard.js';
import correlationsRouter from './routes/correlations.js';
import auditRouter from './routes/audit.js';
import reportsRouter from './routes/reports.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

export const app = express();
const port = Number(process.env.PORT) || 3001;
const host = '0.0.0.0';

const allowedOrigins = [
  'https://forenziq.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // In production allow origin safely
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Root API information endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'FORENZIQ API',
    service: 'Automated Digital Forensics Reporter',
    version: '1.0.0',
    status: 'online',
    health: '/api/health',
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/cases', evidenceRouter);
app.use('/api/cases', correlationsRouter);
app.use('/api/cases', auditRouter);
app.use('/api', findingsRouter);
app.use('/api', reportsRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check endpoint for Render health monitoring
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'forenziq-backend',
    timestamp: new Date().toISOString(),
  });
});

// Central error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, host, () => {
    console.log(`FORENZIQ Backend Server listening on http://${host}:${port}`);
  });
}
