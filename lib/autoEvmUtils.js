// Shared Auto EVM utilities (WebSocket JSON-RPC, unit conversions)

export const AUTO_EVM_WS_URL = 'wss://auto-evm.mainnet.autonomys.xyz/ws';

export const WEI_PER_AI3 = 10n ** 18n; // 18 decimals

export function roundWeiToWholeAI3(wei) {
  return Number((wei + (WEI_PER_AI3 / 2n)) / WEI_PER_AI3);
}

export function hexToBigIntSafe(hex) {
  if (typeof hex !== 'string' || !hex.startsWith('0x')) return 0n;
  try {
    return BigInt(hex);
  } catch {
    return 0n;
  }
}

export async function wsJsonRpc(wsUrl, payload, timeoutMs = 12_000) {
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

export async function autoEvmEthCall({ to, data, wsUrl = AUTO_EVM_WS_URL }) {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'eth_call',
    params: [{ to, data }, 'latest'],
  };
  const res = await wsJsonRpc(wsUrl, payload);
  return hexToBigIntSafe(res?.result);
}

export async function autoEvmEthGetBalance({ address, wsUrl = AUTO_EVM_WS_URL }) {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'eth_getBalance',
    params: [address, 'latest'],
  };
  const res = await wsJsonRpc(wsUrl, payload);
  return hexToBigIntSafe(res?.result);
}
