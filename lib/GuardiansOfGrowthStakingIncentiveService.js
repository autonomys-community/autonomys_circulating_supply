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
      console.log('accountData', accountData);
      const free = accountData?.data?.free ?? 0;
      const reserved = accountData?.data?.reserved ?? 0;
      const freeAI3 = parseFloat(Number(parseTokenAmount(free.toString())).toFixed(4));
      const reservedAI3 = parseFloat(Number(parseTokenAmount(reserved.toString())).toFixed(4));
      // Reserved is already net of 20% fee; reconstruct original by dividing by 0.8
      const originalReservedAI3 = reservedAI3 > 0 ? (reservedAI3 / 0.8) : 0;
      return Math.round(freeAI3 + originalReservedAI3);


    } finally {
      await api.disconnect();
    }

  } catch (error) {
    console.error('Error fetching Guardians of Growth balance:', error);
    return 0;
  }
}


