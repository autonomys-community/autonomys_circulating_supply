// Subspace Foundation Auto EVM wallet exclusion service
// These wallets are owned by the Subspace Foundation and have been transferred
// from the consensus chain to Auto EVM. Their balances should be excluded from
// the circulating supply.

// Auto EVM (chainId 870)
const AUTO_EVM_WS_URL = 'wss://auto-evm.mainnet.autonomys.xyz/ws';

// ---- Units ------------------------------------------------------------------
const WEI_PER_AI3 = 10n ** 18n; // 18 decimals

function roundWeiToWholeAI3(wei) {
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
 * Batch multiple eth_getBalance calls over a single WebSocket connection.
 * Much faster than opening a separate connection per wallet.
 *
 * @param {string[]} addresses - EVM addresses to query
 * @param {string} wsUrl - WebSocket JSON-RPC URL
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Map<string, bigint>>} Map of address → balance in wei
 */
async function batchEthGetBalance(addresses, wsUrl = AUTO_EVM_WS_URL, timeoutMs = 15_000) {
  if (typeof WebSocket === 'undefined') {
    throw new Error('WebSocket is not available in this environment');
  }
  if (addresses.length === 0) return new Map();

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const results = new Map();
    const idToAddress = new Map();
    let settled = false;

    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch { /* noop */ }
      if (!error && results.size >= addresses.length) {
        resolve(results);
      } else {
        const err = error || new Error(
          `Incomplete batch: received ${results.size}/${addresses.length} responses`
        );
        err.partialResults = results;
        reject(err);
      }
    }

    const timer = setTimeout(
      () => finish(new Error(`Batch WebSocket timeout after ${timeoutMs}ms (${results.size}/${addresses.length} responses)`)),
      timeoutMs,
    );

    ws.onopen = () => {
      const baseId = Date.now() * 1000;
      for (let i = 0; i < addresses.length; i++) {
        const id = baseId + i;
        idToAddress.set(id, addresses[i]);
        try {
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            id,
            method: 'eth_getBalance',
            params: [addresses[i], 'latest'],
          }));
        } catch (e) {
          console.warn(`Error sending batch request for ${addresses[i]}:`, e.message);
        }
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const addr = idToAddress.get(msg?.id);
        if (addr) {
          results.set(addr, hexToBigIntSafe(msg?.result));
        }
        if (results.size >= addresses.length) {
          finish();
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = () => finish(new Error('WebSocket error'));
    ws.onclose = () => finish();
  });
}

// ---- Subspace Foundation wallets on Auto EVM --------------------------------
// These wallets hold native AI3 that was transferred from the consensus chain.
// Their balances are queried and subtracted from circulating supply.
//
// Because locked tokens are now fetched live from consensus wallets (not static
// allocation constants), there is NO double-counting risk: when tokens move from
// consensus to Auto EVM, the consensus wallet balance decreases and the Auto EVM
// balance increases — both sides are tracked live so the total stays correct.
const SF_AUTO_EVM_WALLETS = [
  // Hedgey vesting contracts & escrow wallets
  { address: '0x1eeEfDA042CA96be90368fd9309b28Ec4eebDc9a', name: 'Advisors Escrow Holder' },
  { address: '0x99c2Cb8d62Fc041D21367084Ce0DeC646DE6Da73', name: 'Advisors Hedgey Contract Admin' },
  { address: '0xEf0eaA2938F0Dd71BE633a89552143652FBaf00C', name: 'Autonomys Labs Treasury Hedgey Contract Admin' },
  { address: '0xa0A533dc70CD5cBC3427d95deEA2Aa2fc6a913e0', name: 'Investors Escrow Holder' },
  { address: '0x42AbFED9D4d9AF06dB50A80038A334bC5E88E9EB', name: 'Investors Hedgey Contract Admin' },
  { address: '0x27c4aC6BB9b2a67a1F919F2877A76B67BFdc49B0', name: 'Subspace Foundation Long-Term Treasury Beneficiary' },
  { address: '0xB29F4885810749Da79A1bE7C5eF3f3c02fC45485', name: 'Subspace Foundation Long-Term Treasury Hedgey Contract Admin' },
  { address: '0x7180a885fb4Ad69f50122f8EfE7eF2266643E142', name: 'Team Escrow Holder' },
  { address: '0xDB2278a91C8b5DA8585321136d2DDA49D0Cd8f9F', name: 'Team Hedgey Contract Admin' },
  { address: '0xEd91095c812f98AeAF99bdE63418B7d1E137746E', name: 'Vendors Escrow Holder' },
  { address: '0xE6A6DcFFB470031D4eEe2cC9f83FC8d5135496DE', name: 'Vendors Hedgey Contract Admin' },
  // Dynamically tracked wallets
  { address: '0xb7ce125198D190814401a6C31866B206Cb71EbF3', name: 'Ambassador Program' },
  { address: '0xC73995e20Cb56f4E9851e97474B9c6aF95DFf144', name: 'Game of Domains Escrow' },
  { address: '0xF54751A0fe7a6221589EFE1892ae8E9Cee85fD0f', name: 'Guardians of Growth Vault' },
  { address: '0x09884e157cbA9844d7F29ce52Ca04BF0146F3f06', name: 'Market Liquidity' },
  { address: '0x0CE164559900cc9BE9b61cCac7dC6A32cbE4A763', name: 'Subspace Foundation Near-Term Treasury' },
  { address: '0xc48f24BE2Df32d6f2c2c34a9E2EB1Ff420f572E0', name: 'Subspace Foundation Operations' },
];

/**
 * Get the total native AI3 balance across all Subspace Foundation wallets on Auto EVM.
 * All tokens in these wallets are treated as non-circulating.
 *
 * @param {string} wsUrl - WebSocket JSON-RPC URL
 * @returns {Promise<number>} Total balance in whole AI3 (rounded)
 */
export async function getSubspaceFoundationAutoEvmTotalBalance(wsUrl = AUTO_EVM_WS_URL) {
  const addresses = SF_AUTO_EVM_WALLETS.map(w => w.address);
  let balanceMap;

  try {
    balanceMap = await batchEthGetBalance(addresses, wsUrl);
  } catch (batchError) {
    balanceMap = batchError.partialResults || new Map();
    const missing = addresses.filter(a => !balanceMap.has(a));
    const missingNames = missing.map(a => SF_AUTO_EVM_WALLETS.find(w => w.address === a)?.name);
    console.warn(
      `Auto EVM batch incomplete (${balanceMap.size}/${addresses.length}): ${batchError.message}. ` +
      `Retrying ${missing.length} wallet(s) individually: ${missingNames.join(', ')}`
    );

    await Promise.all(missing.map(async (address) => {
      try {
        const wei = await autoEvmEthGetBalance({ address, wsUrl });
        balanceMap.set(address, wei);
      } catch (err) {
        const name = SF_AUTO_EVM_WALLETS.find(w => w.address === address)?.name;
        console.error(`Failed individual retry for ${name} (${address}): ${err.message}`);
      }
    }));
  }

  const stillMissing = addresses.filter(a => !balanceMap.has(a));
  if (stillMissing.length > 0) {
    const names = stillMissing.map(a => SF_AUTO_EVM_WALLETS.find(w => w.address === a)?.name);
    throw new Error(
      `Unable to fetch Auto EVM balances for ${stillMissing.length} wallet(s) after retry: ${names.join(', ')}`
    );
  }

  let total = 0;
  for (const { address } of SF_AUTO_EVM_WALLETS) {
    const wei = balanceMap.get(address) ?? 0n;
    total += roundWeiToWholeAI3(wei);
  }
  return total;
}
