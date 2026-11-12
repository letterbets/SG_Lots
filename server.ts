import express from 'express';
import dotenv from 'dotenv';
import healthHandler from './api/health.ts';
import carparkAvailabilityHandler from './api/carparkavailability.ts';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Serverless /api route endpoints
app.all('/api/health', (req, res) => {
  healthHandler(req, res);
});

app.all('/api/carparkavailability', (req, res) => {
  carparkAvailabilityHandler(req, res);
});

app.all('/api/carpark-availability', (req, res) => {
  carparkAvailabilityHandler(req, res);
});

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static('dist'));
  app.get('*', (_req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
