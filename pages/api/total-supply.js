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
    const totalSupply = 1_000_000_000; // 1 billion
    
    // Return just the number
    res.status(200).json(totalSupply);
  } catch (error) {
    console.error('Error returning total supply:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to return total supply'
    });
  }
}