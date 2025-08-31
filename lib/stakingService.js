// Staking service using Autonomys Auto SDK
import { activate, parseTokenAmount } from '@autonomys/auto-utils';
import { operators } from '@autonomys/auto-consensus';

/**
 * Get the total staked amount including storage fees across all operators
 * @param {string} networkId - Network ID (default: 'mainnet')
 * @returns {Promise<number>} Total staked tokens in AI3 units
 */
export async function getTotalStakedAmount(networkId = 'mainnet') {
  try {
    const api = await activate({ networkId });

    try {
      const allOperators = await operators(api);
      
      let totalStake = 0;
      let totalStorageFund = 0;
      
      allOperators.forEach(operator => {
        const details = operator.operatorDetails;
        if (details) {
          // Add staked amounts using Auto SDK precision (matches Auto Portal)
          if (details.currentTotalStake) {
            const stakeAI3 = Number(parseTokenAmount(details.currentTotalStake.toString())).toFixed(4);
            totalStake += parseFloat(stakeAI3);
          }
          
          // Add storage fee deposits using Auto SDK precision (matches Auto Portal)
          if (details.totalStorageFeeDeposit) {
            const storageAI3 = Number(parseTokenAmount(details.totalStorageFeeDeposit.toString())).toFixed(4);
            totalStorageFund += parseFloat(storageAI3);
          }
        }
      });
      
      // Return combined total rounded to match Auto Portal calculation
      return Math.round(totalStake + totalStorageFund);

    } finally {
      await api.disconnect();
    }

  } catch (error) {
    console.error('Error fetching staking data:', error);
    return 0;
  }
}
