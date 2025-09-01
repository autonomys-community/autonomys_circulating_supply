import { calculateCirculatingSupply, TGE_DATE } from '../../lib/tokenCalculations';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
  }

  try {
    const requestTime = new Date();
    const tgeDate = TGE_DATE;
    
    const circulatingSupply = calculateCirculatingSupply(requestTime, tgeDate);
    
    // Check if CoinGecko format is requested
    if (req.query.format === 'coingecko') {
      res.status(200).json({
        result: circulatingSupply.toFixed(18)
      });
    } else {
      // Return just the number
      res.status(200).json(circulatingSupply);
    }
  } catch (error) {
    console.error('Error calculating circulating supply:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to calculate circulating supply'
    });
  }
}