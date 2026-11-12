import type { Request, Response } from 'express';

export interface LTACarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "lat lng" coordinates e.g. "1.2935 103.8572"
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y'; // C = Car, H = Heavy, Y = Motorcycle
  Agency: 'HDB' | 'LTA' | 'URA';
}

export interface LTAResponse {
  'odata.metadata'?: string;
  value: LTACarparkItem[];
}

// In-memory cache to prevent excessive requests to LTA Datamall and avoid rate limits
interface CacheEntry {
  timestamp: number;
  data: LTACarparkItem[];
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache

const LTA_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

/**
 * Fetch a single 500-item batch from LTA Datamall
 */
async function fetchLTABatch(accountKey: string, skip: number = 0): Promise<LTACarparkItem[]> {
  const url = skip > 0 ? `${LTA_ENDPOINT}?$skip=${skip}` : LTA_ENDPOINT;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`LTA Datamall API error (${res.status} ${res.statusText}): ${errorText}`);
    }

    const json: LTAResponse = await res.json();
    return json.value || [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Serverless Carpark Availability endpoint for LTA Datamall OData service.
 * GET /api/carparkavailability
 */
export default async function handler(req: Request, res: Response) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Retrieve AccountKey from environment variable or request header override (never hardcoded)
  const headerKey = req.headers['accountkey'] as string | undefined;
  const envKey = process.env.LTA_ACCOUNT_KEY;
  const accountKey = (headerKey || envKey || '').trim();

  // Validate that an account key is present and not a dummy placeholder
  if (!accountKey || accountKey === 'YOUR_LTA_ACCOUNT_KEY_HERE') {
    return res.status(200).json({
      status: 'warning',
      configured: false,
      message:
        'LTA_ACCOUNT_KEY is not set. Please configure your LTA_ACCOUNT_KEY environment variable or pass an AccountKey header.',
      endpoint: LTA_ENDPOINT,
      total: 0,
      value: [],
    });
  }

  const querySkip = req.query['$skip'] || req.query['skip'];
  const fetchAll = req.query['all'] !== 'false'; // default to fetching all pages unless specified

  // If specific $skip is requested by client, query that page directly
  if (querySkip !== undefined) {
    const skipNum = parseInt(String(querySkip), 10) || 0;
    try {
      const batch = await fetchLTABatch(accountKey, skipNum);
      return res.status(200).json({
        status: 'success',
        configured: true,
        endpoint: `${LTA_ENDPOINT}?$skip=${skipNum}`,
        skip: skipNum,
        count: batch.length,
        value: batch,
        fetchedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.status(502).json({
        status: 'error',
        configured: true,
        message: `Failed to query LTA Datamall: ${message}`,
      });
    }
  }

  // Use cached data if available and fresh
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({
      status: 'success',
      configured: true,
      cached: true,
      cacheAgeSeconds: Math.round((now - cache.timestamp) / 1000),
      total: cache.data.length,
      value: cache.data,
      fetchedAt: new Date(cache.timestamp).toISOString(),
    });
  }

  // Fetch all carparks across pages (LTA returns 500 records per call)
  try {
    const allCarparks: LTACarparkItem[] = [];
    let currentSkip = 0;
    const maxBatches = 8; // Safety ceiling (~4000 records)

    for (let i = 0; i < maxBatches; i++) {
      const batch = await fetchLTABatch(accountKey, currentSkip);
      if (batch.length === 0) break;
      allCarparks.push(...batch);

      // If less than 500 records returned, we reached the end
      if (batch.length < 500 || !fetchAll) break;
      currentSkip += 500;
    }

    // Save to cache
    cache = {
      timestamp: now,
      data: allCarparks,
    };

    return res.status(200).json({
      status: 'success',
      configured: true,
      cached: false,
      total: allCarparks.length,
      value: allCarparks,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // If cache exists even if expired, return it with a warning
    if (cache) {
      return res.status(200).json({
        status: 'warning',
        configured: true,
        stale: true,
        message: `Live fetch failed (${message}), returning stale cache`,
        total: cache.data.length,
        value: cache.data,
        fetchedAt: new Date(cache.timestamp).toISOString(),
      });
    }

    return res.status(502).json({
      status: 'error',
      configured: true,
      message: `Failed to connect to LTA Datamall: ${message}`,
    });
  }
}
