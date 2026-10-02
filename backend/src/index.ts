import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import casesRouter from './routes/cases.js';
import evidenceRouter from './routes/evidence.js';
import findingsRouter from './routes/findings.js';
import dashboardRouter from './routes/dashboard.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cases', casesRouter);
app.use('/api/cases', evidenceRouter);
app.use('/api', findingsRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Central error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`FORENZIQ Backend Server running on port ${port}`);
  });
}
