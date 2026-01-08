// Ambassadors service (Consensus + Auto EVM helpers)
import { account } from '@autonomys/auto-consensus';
import { activate, parseTokenAmount } from '@autonomys/auto-utils';

// ---- Addresses / RPC --------------------------------------------------------
const DEFAULT_AMBASSADORS_ADDRESS = 'sufqKMnmLekD1NA8smBMLei7cZvvaHLpEXkExdsoi97ezCEtY'; // consensus chain

// Auto EVM (chainId 870)
const AUTO_EVM_WS_URL = 'wss://auto-evm.mainnet.autonomys.xyz/ws';
const DEFAULT_WRAPPED_AI3_CONTRACT_ADDRESS_ON_AUTO_EVM = '0x7ba06C7374566c68495f7e4690093521F6B991bb'; // wrapped AI3 ERC-20
const DEFAULT_HEDGEY_SF_ADMIN_ADDRESS_ON_AUTO_EVM = '0xba0C1DD5072125337D0C827b3162523bA7B20415';

// ---- Units ------------------------------------------------------------------
const WEI_PER_AI3 = 10n ** 18n; // 18 decimals

function roundWeiToWholeAI3(wei) {
  // Round to nearest whole token (keep behavior identical to previous code)
  return Number((wei + (WEI_PER_AI3 / 2n)) / WEI_PER_AI3);
}

function hexToBigIntSafe(hex) {
  if (typeof hex !== 'string' || !hex.startsWith('0x')) return 0n;
  try {
    return BigInt(hex);
  } catch {
    return 0n;
  }
}

function assertEvmAddress(address) {
  const a = (address || '').toLowerCase();
  if (!a.startsWith('0x') || a.length !== 42) {
    throw new Error(`Invalid EVM address: ${address}`);
  }
  return a;
}

function encodeBalanceOfData(holderAddress) {
  // balanceOf(address) selector: 0x70a08231
  const addr = assertEvmAddress(holderAddress).slice(2);
  const padded = addr.padStart(64, '0');
  return `0x70a08231${padded}`;
}

async function wsJsonRpc(wsUrl, payload, timeoutMs = 12_000) {
  if (typeof WebSocket === 'undefined') {
    throw new Error('WebSocket is not available in this environment');
  }

  return await new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      try { ws.close(); } catch { /* noop */ }
      reject(new Error(`WebSocket JSON-RPC timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    ws.onopen = () => {
      try {
        ws.send(JSON.stringify(payload));
      } catch (e) {
        clearTimeout(timer);
        try { ws.close(); } catch { /* noop */ }
        reject(e);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.id !== payload.id) return;
        clearTimeout(timer);
        try { ws.close(); } catch { /* noop */ }
        resolve(msg);
      } catch (e) {
        clearTimeout(timer);
        try { ws.close(); } catch { /* noop */ }
        reject(e);
      }
    };

    ws.onerror = () => {
      clearTimeout(timer);
      try { ws.close(); } catch { /* noop */ }
      reject(new Error('WebSocket error'));
    };
  });
}

async function autoEvmEthCall({ to, data, wsUrl = AUTO_EVM_WS_URL }) {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'eth_call',
    params: [{ to, data }, 'latest'],
  };
  const res = await wsJsonRpc(wsUrl, payload);
  return hexToBigIntSafe(res?.result);
}

async function autoEvmEthGetBalance({ address, wsUrl = AUTO_EVM_WS_URL }) {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'eth_getBalance',
    params: [address, 'latest'],
  };
  const res = await wsJsonRpc(wsUrl, payload);
  return hexToBigIntSafe(res?.result);
}

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
 * Get wrapped AI3 (ERC-20) balanceOf(address) on Autonomys EVM (chainId 870).
 * Wallets holding wrapped AI3 are treated as non-circulating for Ambassadors calculations.
 *
 * @param {string} holderAddress - Wallet address to query
 * @param {string} contractAddress - Wrapped AI3 ERC-20 contract address
 * @param {string} wsUrl - WebSocket JSON-RPC URL
 * @returns {Promise<number>} Balance in whole AI3 (rounded)
 */
export async function getWrappedAi3BalanceOfAI3(
  holderAddress = DEFAULT_HEDGEY_SF_ADMIN_ADDRESS_ON_AUTO_EVM,
  contractAddress = DEFAULT_WRAPPED_AI3_CONTRACT_ADDRESS_ON_AUTO_EVM,
  wsUrl = AUTO_EVM_WS_URL
) {
  try {
    const data = encodeBalanceOfData(holderAddress);
    const wei = await autoEvmEthCall({ to: contractAddress, data, wsUrl });
    return roundWeiToWholeAI3(wei);
  } catch (error) {
    console.error('Error fetching wrapped AI3 balanceOf on Auto EVM:', error);
    return 0;
  }
}

/**
 * Get native AI3 balance of an address on Autonomys EVM (chainId 870).
 * @param {string} address - EVM address to query
 * @param {string} wsUrl - WebSocket JSON-RPC URL
 * @returns {Promise<number>} Balance in whole AI3 (rounded)
 */
export async function getAutoEvmNativeAi3BalanceAI3(
  address = DEFAULT_HEDGEY_SF_ADMIN_ADDRESS_ON_AUTO_EVM,
  wsUrl = AUTO_EVM_WS_URL
) {
  try {
    const wei = await autoEvmEthGetBalance({ address, wsUrl });
    return roundWeiToWholeAI3(wei);
  } catch (error) {
    console.error('Error fetching Auto EVM native AI3 balance:', error);
    return 0;
  }
}


