import React from 'react';
import { StacksScore, Badge } from '../services/scoreService';

interface Props {
  score: StacksScore;
  badges: Badge[];
}

const ScoreCard: React.FC<Props> = ({ score, badges }) => {
  const earnedBadges = badges.filter(b => b.earned);
  const unearnedBadges = badges.filter(b => !b.earned);
  const pct = Math.min(100, score.total);

  return (
    <div className="space-y-4">
      {/* Score card */}
      <div className="bg-white border border-black/8 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono uppercase tracking-widest text-black/30">Stacks Score</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ color: score.tierColor, borderColor: score.tierColor + '40', backgroundColor: score.tierColor + '10' }}>
            {score.tier}
          </span>
        </div>

        {/* Big score */}
        <div className="flex items-end gap-2">
          <span className="text-6xl font-black tracking-tighter">{score.total}</span>
          <span className="text-black/30 mb-2 text-lg">/100</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-black/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, backgroundColor: score.tierColor }}
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-4 gap-3 pt-1">
          {[
            { label: 'Balance', value: score.breakdown.balance, max: 30 },
            { label: 'Stacking', value: score.breakdown.stacking, max: 25 },
            { label: 'Activity', value: score.breakdown.activity, max: 25 },
            { label: 'NFTs', value: score.breakdown.nfts, max: 20 },
          ].map(({ label, value, max }) => (
            <div key={label} className="text-center">
              <div className="h-1 bg-black/5 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{ width: `${(value / max) * 100}%` }} />
              </div>
              <p className="text-xs font-bold">{value}</p>
              <p className="text-[10px] text-black/30 font-mono uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white border border-black/8 p-6 space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-black/30">
          Badges — {earnedBadges.length}/{badges.length} earned
        </p>
        <div className="grid grid-cols-2 gap-2">
          {earnedBadges.map(badge => (
            <div key={badge.id} className="flex items-center gap-3 p-3 border border-black/8 bg-black/2">
              <span className="text-xl">{badge.emoji}</span>
              <div>
                <p className="text-xs font-bold">{badge.label}</p>
                <p className="text-[10px] text-black/30">{badge.description}</p>
              </div>
            </div>
          ))}
          {unearnedBadges.map(badge => (
            <div key={badge.id} className="flex items-center gap-3 p-3 border border-black/5 opacity-30">
              <span className="text-xl grayscale">{badge.emoji}</span>
              <div>
                <p className="text-xs font-bold">{badge.label}</p>
                <p className="text-[10px] text-black/30">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
