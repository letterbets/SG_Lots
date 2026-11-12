import type { Request, Response } from 'express';

/**
 * Serverless health check endpoint.
 * GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const ltaKey = process.env.LTA_ACCOUNT_KEY;
  const isLtaConfigured = Boolean(ltaKey && ltaKey !== 'YOUR_LTA_ACCOUNT_KEY_HERE' && ltaKey.trim().length > 0);

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SG Carpark Live API Gateway',
    integrations: {
      ltaDatamall: {
        configured: isLtaConfigured,
        endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
        instructions: isLtaConfigured
          ? 'LTA AccountKey is loaded from environment'
          : 'Set LTA_ACCOUNT_KEY in your .env or server environment to enable live Datamall OData feed',
      },
    },
  });
}
