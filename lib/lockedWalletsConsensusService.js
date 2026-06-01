// Live balance fetching for locked/non-circulating wallets on the consensus chain.
// Replaces the previously hardcoded ~497M static constant.
// Tokens can only exist on consensus OR Auto EVM (not both), so fetching both
// sides live eliminates any double-counting when tokens move between chains.

import { account } from '@autonomys/auto-consensus';
import { activate, parseTokenAmount } from '@autonomys/auto-utils';

const LOCKED_CONSENSUS_WALLETS = [
  { address: 'sucGPHK3b4REe2DNRvNaUrmcoXVDDZVasm7zBNtev4zUpLrp4', name: 'Investors' },
  { address: 'sugc77Zny6kg9X4mCs1pe2aunLSb1UcUrDokDLp1ho2FUE6wj', name: 'SF Long-Term Treasury' },
  { address: 'suc7ykog1bVpzUAFCHDsobCtmtcVEXjTpPNJ7vEHGmcZA13kd', name: 'Team (Founders + Staff)' },
  { address: 'sucVFW97RnRYzXE1hncq4Q6E3ygxVv4Ap8KvcWMCEfF4QZwGY', name: 'DevCo Treasury' },
  { address: 'sudUExCScaD4JEk3iALh69PFPUJcmu4ziwBByGiGnMgr1ouj5', name: 'Advisors' },
  { address: 'sugKyc3Qs9WWqeT2vVynQsnQukTrfGwofg8FdrtTPprQCUXS7', name: 'Vendors' },
  { address: 'sueCdBhsNJ9LH76wYyJYhK8fvcvYt1q3J3AwWq674rwPEvbKS', name: 'Game of Domains' },
];

/**
 * Fetch the total balance (free + reserved) across all locked consensus wallets.
 * @param {string} networkId
 * @returns {Promise<number>} Total in whole AI3 (rounded)
 */
export async function getLockedWalletsConsensusTotalBalance(networkId = 'mainnet') {
  let api;
  try {
    api = await activate({ networkId });
  } catch (error) {
    console.error('Error connecting to consensus chain for locked wallets:', error);
    return 0;
  }

  try {
    const balances = await Promise.all(
      LOCKED_CONSENSUS_WALLETS.map(async ({ address, name }) => {
        try {
          const accountData = await account(api, address);
          const free = accountData?.data?.free ?? 0;
          const reserved = accountData?.data?.reserved ?? 0;
          const totalBalance = free + reserved;
          return Math.round(
            parseFloat(Number(parseTokenAmount(totalBalance.toString())).toFixed(4))
          );
        } catch (error) {
          console.warn(`Error fetching locked wallet balance for ${name} (${address}):`, error.message);
          return 0;
        }
      })
    );

    return balances.reduce((sum, bal) => sum + bal, 0);
  } catch (error) {
    console.error('Error fetching locked consensus wallet balances:', error);
    return 0;
  } finally {
    try { await api.disconnect(); } catch { /* noop */ }
  }
}
