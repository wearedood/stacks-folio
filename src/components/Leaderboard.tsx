import React, { useEffect, useState } from 'react';
import { StacksScore } from '../services/scoreService';

interface Entry {
  address: string;
  score: number;
  tier: string;
  tierColor: string;
  badges: number;
  timestamp: number;
}

const shortAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const Leaderboard: React.FC<{
  currentAddress: string;
  currentScore: StacksScore;
  currentBadges: number;
}> = ({ currentAddress, currentScore, currentBadges }) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const entry: Entry = {
      address: currentAddress,
      score: currentScore.total,
      tier: currentScore.tier,
      tierColor: currentScore.tierColor,
      badges: currentBadges,
      timestamp: Date.now(),
    };
    const stored = localStorage.getItem('sf_leaderboard');
    let board: Entry[] = stored ? JSON.parse(stored) : [];
    const idx = board.findIndex(e => e.address === currentAddress);
    if (idx >= 0) board[idx] = entry; else board.push(entry);
    board = board.sort((a, b) => b.score - a.score).slice(0, 20);
    localStorage.setItem('sf_leaderboard', JSON.stringify(board));
    setEntries(board);
  }, [currentAddress, currentScore, currentBadges]);

  const myRank = entries.findIndex(e => e.address === currentAddress) + 1;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-black/8 p-4">
        <p className="text-xs font-mono uppercase tracking-widest text-black/30 mb-1">Your Rank</p>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black">#{myRank || 1}</span>
          <span className="text-black/30 text-sm">of {entries.length} wallets</span>
        </div>
        <p className="text-[10px] text-black/20 font-mono mt-2">Rankings update each time a wallet connects</p>
      </div>
      <div className="bg-white border border-black/8 divide-y divide-black/5">
        <div className="px-5 py-3 grid grid-cols-12 text-[10px] font-mono uppercase tracking-widest text-black/25">
          <span className="col-span-1">#</span>
          <span className="col-span-6">Wallet</span>
          <span className="col-span-3 text-right">Score</span>
          <span className="col-span-2 text-right">Badges</span>
        </div>
        {entries.map((entry, i) => (
          <div key={entry.address}
            className={`px-5 py-3.5 grid grid-cols-12 items-center ${entry.address === currentAddress ? 'bg-black/2' : ''}`}>
            <span className="col-span-1 text-xs font-mono text-black/30">{i + 1}</span>
            <div className="col-span-6 flex items-center gap-2">
              <span className="text-sm font-mono">{shortAddr(entry.address)}</span>
              {entry.address === currentAddress && (
                <span className="text-[9px] bg-black text-white px-1.5 py-0.5 font-bold uppercase">You</span>
              )}
            </div>
            <div className="col-span-3 text-right">
              <span className="text-sm font-black" style={{ color: entry.tierColor }}>{entry.score}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-xs text-black/40">{entry.badges}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
