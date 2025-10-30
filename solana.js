// Frontend now calls backend API; keep function names to minimize UI changes.
export const testConnection = async () => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Backend unavailable');
    const data = await res.json();
    return { connected: true, ...data };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export const getNetworkStats = async () => {
  const res = await fetch('/api/network-stats');
  if (!res.ok) throw new Error('Failed to fetch network stats');
  return await res.json();
};

export const getSolanaExplorerUrl = (signature, cluster = 'devnet') => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

export const getPayerAddress = async () => {
  try {
    const res = await fetch('/api/payer');
    if (!res.ok) return null;
    const data = await res.json();
    return data.address || null;
  } catch {
    return null;
  }
};

export const storeAidOnBlockchain = async (aidData) => {
  try {
    const res = await fetch('/api/aid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aidData),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return {
      signature: 'sim_' + Math.random().toString(36).slice(2).padEnd(88, 'x'),
      blockTime: Math.floor(Date.now() / 1000),
      slot: Math.floor(Math.random() * 1000000),
      memo: `AidLedger|${aidData.action}|Simulated`,
      explorerUrl: '#',
      simulated: true,
      onChain: false,
      error: e.message,
    };
  }
};

export const getTransactionWithMemo = async (_signature) => {
  return null;
};

export const transferAidFunds = async ({ recipient, amountLamports, memo } = {}) => {
  try {
    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amountLamports, memo }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Transfer failed' }));
      throw new Error(error.error || 'Transfer failed');
    }
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
};
