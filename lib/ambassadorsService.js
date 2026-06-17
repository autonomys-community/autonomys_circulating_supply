// Ambassadors service (Consensus chain)
import { account } from '@autonomys/auto-consensus';
import { activate, parseTokenAmount } from '@autonomys/auto-utils';

// ---- Addresses --------------------------------------------------------------
const DEFAULT_AMBASSADORS_ADDRESS = 'sufqKMnmLekD1NA8smBMLei7cZvvaHLpEXkExdsoi97ezCEtY'; // consensus chain

/**
 * Get balance of the Ambassadors wallet (free + reserved)
 * All tokens that remain in this wallet are considered locked (non-circulating).
 * @param {string} networkId - Network ID (default: 'mainnet')
 * @param {string} address - Wallet address (default: Ambassadors wallet)
 * @returns {Promise<number>} Balance in AI3 units (rounded)
 */
export async function getAmbassadorsWalletBalance(
  networkId = 'mainnet',
  address = DEFAULT_AMBASSADORS_ADDRESS
) {
  try {
    const api = await activate({ networkId });

    try {
      const accountData = await account(api, address);
      const free = accountData?.data?.free ?? 0;
      const reserved = accountData?.data?.reserved ?? 0;
      const totalBalance = free + reserved;
      const balanceAI3 = parseFloat(Number(parseTokenAmount(totalBalance.toString())).toFixed(4));
      return Math.round(balanceAI3);
    } finally {
      await api.disconnect();
    }
  } catch (error) {
    console.error('Error fetching Ambassadors wallet balance:', error);
    return 0;
  }
}
