// Guardians of Growth service using Autonomys Auto SDK
import { account } from '@autonomys/auto-consensus';
import { activate, parseTokenAmount } from '@autonomys/auto-utils';

const DEFAULT_GUARDIANS_OF_GROWTH_ADDRESS = 'sugQzjjyAfhzktFDdAkZrcTq5qzMaRoSV2qs1gTcjjuBeybWT';

/**
 * Get free balance of the Guardians of Growth wallet
 * @param {string} networkId - Network ID (default: 'mainnet')
 * @param {string} address - Wallet address (default: Guardians of Growth wallet)
 * @returns {Promise<number>} Free balance in AI3 units (rounded)
 */
export async function getGuardiansOfGrowthStakingIncentiveWalletBalance(
  networkId = 'mainnet',
  address = DEFAULT_GUARDIANS_OF_GROWTH_ADDRESS
) {
  try {
    const api = await activate({ networkId });

    try {
      const accountData = await account(api, address);
      const free = accountData?.data?.free;
      const AI3balance = Number(parseTokenAmount((free ?? 0).toString())).toFixed(4);
      return Math.round(parseFloat(AI3balance));

    } finally {
      await api.disconnect();
    }

  } catch (error) {
    console.error('Error fetching Guardians of Growth balance:', error);
    return 0;
  }
}


