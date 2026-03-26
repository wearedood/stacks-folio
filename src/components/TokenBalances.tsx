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
            const rawSymbol = parts[1] ?? nameParts[1] ?? '???';
            // Clean up symbol: remove common suffixes, uppercase
            const symbol = rawSymbol
              .replace(/-token$/i, '')
              .replace(/-v\d+$/i, '')
              .replace(/-/g, '')
              .toUpperCase()
              .slice(0, 6);
            const decimals = data.decimals ?? 6;
            return {
              name: rawSymbol.replace(/-/g, ' ').toUpperCase(),
              symbol,
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
            {/* Token symbol badge — prominent */}
            <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-[10px] tracking-tight">{token.symbol.slice(0, 4)}</span>
            </div>
            <div>
              <p className="text-sm font-bold">{token.symbol}</p>
              <p className="text-[10px] font-mono text-black/25 truncate max-w-[160px]">{token.contractId.split('.')[1]}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold tabular-nums">
              {token.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
            </span>
            <p className="text-[10px] font-mono text-black/30">{token.symbol}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TokenBalances;
