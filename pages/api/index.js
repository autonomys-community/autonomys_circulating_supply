import { calculateCirculatingSupply, TGE_DATE } from '../../lib/tokenCalculations';

export default function handler(req, res) {
  // Set CORS headers for POST requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Use current time at the moment of request
    const requestTime = new Date();
    const tgeDate = TGE_DATE; // July 16, 2025 12:30PM EST
    
    // Allow optional date override in request body for testing/historical data
    const { date: customDate } = req.body || {};
    const calculationDate = customDate ? new Date(customDate) : requestTime;
    
    // Validate custom date if provided
    if (customDate && isNaN(calculationDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Please provide date in ISO 8601 format (e.g., "2025-08-21T12:00:00Z")'
      });
    }
    
    const circulatingSupply = calculateCirculatingSupply(calculationDate, tgeDate);
    const totalSupply = 1_000_000_000;
    const lockedSupply = totalSupply - circulatingSupply;

    const response = {
      total_supply: totalSupply,
      circulating_supply: circulatingSupply,
      locked_supply: lockedSupply,
      circulating_percentage: ((circulatingSupply / totalSupply) * 100).toFixed(2),
      calculation_date: calculationDate.toISOString(),
      request_time: requestTime.toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error calculating circulating supply:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to calculate circulating supply'
    });
  }
}