import React from 'react';
import { StacksScore } from '../services/scoreService';

const ScoreVisual: React.FC<{ score: StacksScore }> = ({ score }) => {
  const pct = score.total / 100;
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f0f0f0" strokeWidth="6" />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={score.tierColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tighter leading-none">{score.total}</span>
          <span className="text-[10px] font-mono text-black/30 uppercase tracking-widest">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color: score.tierColor }}>{score.tier}</p>
        <div className="flex gap-3 mt-2 justify-center">
          {[
            { label: 'Bal', value: score.breakdown.balance, max: 30 },
            { label: 'Stack', value: score.breakdown.stacking, max: 25 },
            { label: 'Txns', value: score.breakdown.activity, max: 25 },
            { label: 'NFTs', value: score.breakdown.nfts, max: 20 },
          ].map(({ label, value, max }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-1 h-8 bg-black/5 rounded-full overflow-hidden flex flex-col-reverse">
                <div className="bg-black rounded-full transition-all duration-700" style={{ height: `${(value / max) * 100}%` }} />
              </div>
              <span className="text-[9px] font-mono text-black/25 uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreVisual;
