import React, { useEffect, useState } from 'react';

interface Token { name: string; symbol: string; balance: number; contractId: string; }

const HIRO_API = 'https://api.hiro.so';

const TokenBalances: React.FC<{ address: string }> = ({ address }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${HIRO_API}/extended/v1/address/${address}/balances`)
      .then(r => r.json())
      .then(d => {
        const fungible = d.fungible_tokens ?? {};
        const list: Token[] = Object.entries(fungible)
          .map(([contractId, data]: [string, any]) => {
            const parts = contractId.split('::');
            const nameParts = parts[0].split('.');
            const symbol = parts[1] ?? nameParts[1] ?? '???';
            const decimals = data.decimals ?? 6;
            return {
              name: symbol.replace(/-/g, ' ').toUpperCase(),
              symbol: symbol.toUpperCase().slice(0, 8),
              balance: parseInt(data.balance ?? '0') / Math.pow(10, decimals),
              contractId: parts[0],
            };
          })
          .filter(t => t.balance > 0);
        setTokens(list);
      })
      .catch(() => setTokens([]))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return (
    <div className="bg-white border border-black/8 p-6">
      <span className="text-xs text-black/30 font-mono uppercase tracking-widest">Loading tokens...</span>
    </div>
  );

  if (!tokens.length) return (
    <div className="bg-white border border-black/8 p-6">
      <p className="text-xs font-mono uppercase tracking-widest text-black/30 mb-2">Token Balances</p>
      <p className="text-sm text-black/30">No SIP-010 tokens found</p>
    </div>
  );

  return (
    <div className="bg-white border border-black/8 divide-y divide-black/5">
      <div className="px-5 py-3">
        <p className="text-xs font-mono uppercase tracking-widest text-black/30">Token Balances</p>
      </div>
      {tokens.map(token => (
        <div key={token.contractId} className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black/5 rounded-sm flex items-center justify-center">
              <span className="text-[9px] font-black text-black/40">{token.symbol.slice(0, 3)}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{token.name}</p>
              <p className="text-[10px] font-mono text-black/25 truncate max-w-[160px]">{token.contractId.split('.')[1]}</p>
            </div>
          </div>
          <span className="text-sm font-bold tabular-nums">
            {token.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TokenBalances;
