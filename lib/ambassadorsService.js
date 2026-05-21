// Ambassadors service (Consensus + Auto EVM helpers)
import { account } from '@autonomys/auto-consensus';
import { activate, parseTokenAmount } from '@autonomys/auto-utils';
import { AUTO_EVM_WS_URL, roundWeiToWholeAI3, autoEvmEthCall, autoEvmEthGetBalance } from './autoEvmUtils.js';

// ---- Addresses / RPC --------------------------------------------------------
const DEFAULT_AMBASSADORS_ADDRESS = 'sufqKMnmLekD1NA8smBMLei7cZvvaHLpEXkExdsoi97ezCEtY'; // consensus chain
const DEFAULT_WRAPPED_AI3_CONTRACT_ADDRESS_ON_AUTO_EVM = '0x7ba06C7374566c68495f7e4690093521F6B991bb'; // wrapped AI3 ERC-20
const DEFAULT_HEDGEY_ADMIN_ADDRESS_ON_AUTO_EVM = '0xba0C1DD5072125337D0C827b3162523bA7B20415';

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

/**
 * Get the total supply of wrapped AI3 (ERC-20) on Autonomys EVM (chainId 870).
 * All wrapped AI3 tokens are treated as non-circulating.
 *
 * This uses JSON-RPC method `eth_call` over WebSocket RPC to call:
 * - totalSupply(): 0x18160ddd
 *
 * RPC: wss://auto-evm.mainnet.autonomys.xyz/ws
 * Chain ID: 870
 *
 * @param {string} contractAddress - Wrapped AI3 ERC-20 contract address
 * @param {string} wsUrl - WebSocket JSON-RPC URL
 * @returns {Promise<number>} Total supply in whole AI3 (rounded)
 */
export async function getWrappedAi3TotalSupplyAI3(
  contractAddress = DEFAULT_WRAPPED_AI3_CONTRACT_ADDRESS_ON_AUTO_EVM,
  wsUrl = AUTO_EVM_WS_URL
) {
  try {
    // totalSupply() selector: 0x18160ddd
    const wei = await autoEvmEthCall({ to: contractAddress, data: '0x18160ddd', wsUrl });
    return roundWeiToWholeAI3(wei);
  } catch (error) {
    console.error('Error fetching wrapped AI3 totalSupply on Auto EVM:', error);
    return 0;
  }
}

/**
 * Get native AI3 balance of an address on Autonomys EVM (chainId 870).
 * @param {string} address - EVM address to query
 * @param {string} wsUrl - WebSocket JSON-RPC URL
 * @returns {Promise<number>} Balance in whole AI3 (rounded)
 */
export async function getHedgeyAdminAi3Balance(
  address = DEFAULT_HEDGEY_ADMIN_ADDRESS_ON_AUTO_EVM,
  wsUrl = AUTO_EVM_WS_URL
) {
  try {
    const wei = await autoEvmEthGetBalance({ address, wsUrl });
    return roundWeiToWholeAI3(wei);
  } catch (error) {
    console.error('Error fetching Hedgey admin native AI3 balance on Auto EVM:', error);
    return 0;
  }
}
