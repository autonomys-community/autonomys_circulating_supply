// Subspace Foundation Near-Term Treasury service using Autonomys Auto SDK
import { account } from '@autonomys/auto-consensus';
import { activate, parseTokenAmount } from '@autonomys/auto-utils';

const DEFAULT_SF_OPERATIONS_ADDRESS = 'suesYE9yAqNJrMiZPY4hKNMjMTXBkkD1rHgQrSNes1bUnw37U';

/**
 * Get free balance of the Near-Term Treasury wallet
 * @param {string} networkId - Network ID (default: 'mainnet')
 * @param {string} address - Wallet address (default: Near-Term Treasury wallet)
 * @returns {Promise<number>} Free balance in AI3 units (rounded)
 */
export async function getSubspaceFoundationOperationsWalletBalance(
  networkId = 'mainnet',
  address = DEFAULT_SF_OPERATIONS_ADDRESS
) {
  try {
    const api = await activate({ networkId });

    try {
      const accountData = await account(api, address);
     
      const free = accountData?.data?.free ?? 0;
      const reserved = accountData?.data?.reserved ?? 0;
      const totalBalance = free + reserved;
      const availableBalance = parseFloat(Number(parseTokenAmount(totalBalance.toString())).toFixed(4));
      return Math.round(availableBalance);
    } finally {
      await api.disconnect();
    }
  } catch (error) {
    console.error('Error fetching Near-Term Treasury free balance:', error);
    return 0;
  }
}
