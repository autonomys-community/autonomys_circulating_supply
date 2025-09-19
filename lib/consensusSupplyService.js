// Consensus token supply service using Autonomys Auto SDK
import { parseTokenAmount } from '@autonomys/auto-utils';
import { totalIssuance } from '@autonomys/auto-consensus';

/**
 * Get the total consensus token supply
 * @param {string} networkId - Network ID (default: 'mainnet')
 * @returns {Promise<number>} Total consensus token supply in AI3 units
 */
export async function getConsensusTokenSupply(networkId = 'mainnet') {
  try {
    const consensusIssuance = await totalIssuance(networkId);
    
    // Convert from shannons to AI3 tokens using Auto SDK precision
    const supplyAI3 = Number(parseTokenAmount(consensusIssuance.toString())).toFixed(4);
    
    // Return rounded value to match Auto Portal calculation
    return Math.round(parseFloat(supplyAI3));

  } catch (error) {
    console.error('Error fetching consensus token supply:', error);
    return 0;
  }
}