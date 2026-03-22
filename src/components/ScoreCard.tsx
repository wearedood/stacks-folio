import React from 'react';
import { StacksScore, Badge } from '../services/scoreService';
import ScoreVisual from './ScoreVisual';

interface Props { score: StacksScore; badges: Badge[]; }

const ScoreCard: React.FC<Props> = ({ score, badges }) => {
  const earned = badges.filter(b => b.earned);
  const unearned = badges.filter(b => !b.earned);

  return (
    <div className="space-y-4">
      {/* Minimalist score visual */}
      <div className="bg-white border border-black/8">
        <ScoreVisual score={score} />
        <div className="border-t border-black/5 grid grid-cols-4 divide-x divide-black/5">
          {[
            { label: 'Balance', value: score.breakdown.balance, max: 30 },
            { label: 'Stacking', value: score.breakdown.stacking, max: 25 },
            { label: 'Activity', value: score.breakdown.activity, max: 25 },
            { label: 'NFTs', value: score.breakdown.nfts, max: 20 },
          ].map(({ label, value, max }) => (
            <div key={label} className="px-3 py-3 text-center">
              <p className="text-sm font-black">{value}<span className="text-black/20 font-normal text-xs">/{max}</span></p>
              <p className="text-[10px] font-mono text-black/30 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white border border-black/8 p-6 space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-black/30">
          Badges — {earned.length}/{badges.length} earned
        </p>
        <div className="grid grid-cols-2 gap-2">
          {earned.map(badge => (
            <div key={badge.id} className="flex items-center gap-3 p-3 border border-black/8">
              <span className="text-xl">{badge.emoji}</span>
              <div>
                <p className="text-xs font-bold">{badge.label}</p>
                <p className="text-[10px] text-black/30">{badge.description}</p>
              </div>
            </div>
          ))}
          {unearned.map(badge => (
            <div key={badge.id} className="flex items-center gap-3 p-3 border border-black/5 opacity-25">
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
