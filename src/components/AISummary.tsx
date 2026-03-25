import React, { useState } from 'react';
import { PortfolioData } from '../services/stacksService';

interface Props {
  portfolio: PortfolioData;
}

const AISummary: React.FC<Props> = ({ portfolio }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are a witty crypto analyst. In exactly 3 short punchy lines, roast and summarize this Stacks wallet. Be clever, funny, and specific to the data. No emojis. No markdown.

Wallet data:
- STX Balance: ${portfolio.stxBalance.toFixed(2)} STX ($${portfolio.stxBalanceUsd.toFixed(2)} USD)
- Stacking: ${portfolio.stacking.stacked ? `Yes, ${portfolio.stacking.amountStacked.toFixed(0)} STX locked` : 'Not stacking'}
- Total Received: ${portfolio.totalReceived.toFixed(2)} STX
- Total Sent: ${portfolio.totalSent.toFixed(2)} STX
- Transactions: ${portfolio.transactionCount}
- NFTs: ${portfolio.nfts.length}
- BNS Name: ${portfolio.bnsName ?? 'None'}

Write exactly 3 lines. Each line should be a standalone sentence. Be brutally honest but entertaining.`;

      const response = await fetch('https://stacks-folio-proxy.wearedood.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error(`Worker error: ${response.status}`);

      const data = await response.json();
      setSummary((data.text ?? '').trim());
    } catch (e: any) {
      setError('Failed to generate roast. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-black/8 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-black/30">AI Summary</p>
        <span className="text-[10px] font-mono text-black/20 uppercase">Powered by Gemini</span>
      </div>

      {!summary && !loading && (
        <div className="space-y-3">
          <p className="text-sm text-black/40">Get a 3-line AI roast of your wallet based on your on-chain activity.</p>
          <button
            onClick={generate}
            className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
          >
            Roast My Wallet
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-4">
          <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin flex-shrink-0"></span>
          <span className="text-sm text-black/40">AI is reading your chain history...</span>
        </div>
      )}

      {error && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={generate}
            className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <div className="border-l-2 border-black pl-4 space-y-3">
            {summary.split('\n').filter(l => l.trim()).map((line, i) => (
              <p key={i} className="text-sm leading-relaxed">{line}</p>
            ))}
          </div>
          <button
            onClick={generate}
            className="text-xs font-mono text-black/30 uppercase tracking-widest hover:text-black transition-colors underline"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
};

export default AISummary;
