import React, { useEffect, useState } from 'react';

interface PricePoint { date: string; price: number; }

const PriceChart: React.FC = () => {
  const [data, setData] = useState<PricePoint[]>([]);
  const [range, setRange] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.coingecko.com/api/v3/coins/blockstack/market_chart?vs_currency=usd&days=${range}`)
      .then(r => r.json())
      .then(d => {
        const prices: PricePoint[] = d.prices.map(([ts, price]: [number, number]) => ({
          date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price,
        }));
        // Downsample to ~20 points
        const step = Math.max(1, Math.floor(prices.length / 20));
        setData(prices.filter((_, i) => i % step === 0));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return (
    <div className="bg-white border border-black/8 p-6">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
        <span className="text-xs text-black/30 font-mono uppercase tracking-widest">Loading chart...</span>
      </div>
    </div>
  );

  if (!data.length) return null;

  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range2 = max - min || 1;
  const W = 400; const H = 100;
  const pad = 8;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.price - min) / range2) * (H - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const first = prices[0];
  const last = prices[prices.length - 1];
  const change = ((last - first) / first) * 100;
  const isUp = change >= 0;

  return (
    <div className="bg-white border border-black/8 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-black/30">STX Price</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-black tracking-tighter">${last.toFixed(4)}</span>
            <span className={`text-xs font-bold mb-1 ${isUp ? 'text-green-600' : 'text-red-500'}`}>
              {isUp ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {([7, 30] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-widest transition-colors ${range === r ? 'bg-black text-white' : 'text-black/30 hover:text-black'}`}>
              {r}D
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <polyline points={points} fill="none" stroke={isUp ? '#16a34a' : '#dc2626'} strokeWidth="1.5" />
        {/* Fill */}
        <polygon
          points={`${pad},${H - pad} ${points} ${W - pad},${H - pad}`}
          fill={isUp ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)'}
        />
      </svg>
      <div className="flex justify-between text-[10px] font-mono text-black/20">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};

export default PriceChart;
