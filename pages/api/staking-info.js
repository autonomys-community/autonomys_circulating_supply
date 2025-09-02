import { getTotalStakedAmount } from '../../lib/stakingService.js';

export default async function handler(req, res) {
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
    const totalStaked = await getTotalStakedAmount();
    res.status(200).json({
      total_staked: totalStaked,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching staking information:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch staking information',
      details: error.message
    });
  }
}
