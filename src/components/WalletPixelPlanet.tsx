import React, { useEffect, useRef, useState } from 'react';
import { PortfolioData } from '../services/stacksService';
import { StacksScore } from '../services/scoreService';

interface Props {
  portfolio: PortfolioData;
  score: StacksScore;
  address: string;
}

const mkRand = (seed: number) => {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
};

const PLANET_TYPES = [
  { name: 'Asteroid',  minScore: 0,  colors: ['#6b6b6b','#4a4a4a','#888888','#333333','#999999','#222222'] },
  { name: 'Ice Moon',  minScore: 20, colors: ['#a8d8ea','#7ec8e3','#d4f1f4','#5bb3cc','#e8f8fb','#4a9ab5'] },
  { name: 'Rocky',     minScore: 35, colors: ['#c4752a','#8b4513','#d4924a','#6b3410','#e0a060','#4a2208'] },
  { name: 'Lava',      minScore: 55, colors: ['#ff4500','#cc2200','#ff6600','#880000','#ff8800','#440000'] },
  { name: 'Gas Giant', minScore: 70, colors: ['#e8c46a','#c9a227','#f0d080','#8b6914','#f5e0a0','#6b4f10'] },
  { name: 'Ocean',     minScore: 85, colors: ['#1a6b8a','#0d4d6b','#2a8baa','#0a3347','#3aaaca','#061f2e'] },
];

export const drawPlanet = (canvas: HTMLCanvasElement, portfolio: PortfolioData, score: StacksScore): string => {
  const SCALE = 4;
  const W = 80, H = 80;
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const g = off.getContext('2d')!;
  const seed = Math.abs(score.total * 1000 + portfolio.transactionCount * 97 + portfolio.nfts.length * 31 + Math.round(portfolio.stxBalance * 10)) | 0;
  const ptype = PLANET_TYPES.filter(t => score.total >= t.minScore).pop()!;
  const cols = ptype.colors;
  const cx = 38, cy = 42, pr = 22;
  g.fillStyle = '#050510'; g.fillRect(0, 0, W, H);
  const srand = mkRand(seed + 777);
  for (let i = 0; i < 70; i++) {
    const sx = Math.floor(srand() * W), sy = Math.floor(srand() * H);
    g.fillStyle = srand() > 0.92 ? '#fff' : srand() > 0.6 ? '#aaa' : '#444';
    g.fillRect(sx, sy, 1, 1);
  }
  if (portfolio.stacking.stacked || score.total > 60) {
    for (let rx = -pr - 9; rx <= pr + 9; rx++) {
      const ry = Math.round(rx * 0.22), dist = Math.abs(rx);
      if (dist < pr - 2 || dist > pr + 8) continue;
      g.globalAlpha = dist < pr + 3 ? 0.55 : 0.25;
      g.fillStyle = cols[1];
      g.fillRect(cx + rx, cy + ry - 1, 1, 1);
      g.fillRect(cx + rx, cy + ry, 1, 1);
      g.globalAlpha = 1;
    }
  }
  for (let py = cy - pr; py <= cy + pr; py++) {
    for (let px = cx - pr; px <= cx + pr; px++) {
      const dx = px - cx, dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > pr) continue;
      const lat = dy / pr;
      let col = Math.abs(lat) < 0.15 ? cols[4] : Math.abs(lat) < 0.4 ? cols[0] : Math.abs(lat) < 0.7 ? cols[1] : cols[5];
      const nrand = mkRand((px * 73 + py * 37 + seed) | 0);
      if (nrand() > 0.65) col = nrand() > 0.5 ? cols[2] : cols[3];
      if (ptype.name === 'Lava') { const lr = mkRand((px*11+py*17+seed+300)|0); if (lr() > 0.88) col = '#ffcc00'; }
      if (ptype.name === 'Ice Moon') { const ir = mkRand((px*11+py*17+seed+500)|0); if (ir() > 0.93) col = cols[5]; }
      const shade = 1 - (dx * 0.012 + dy * 0.014) * (dist / pr);
      g.fillStyle = col; g.globalAlpha = Math.max(0.5, Math.min(1, shade));
      g.fillRect(px, py, 1, 1); g.globalAlpha = 1;
    }
  }
  const craterCount = Math.min(Math.floor(portfolio.transactionCount / 3), 7);
  const crand = mkRand(seed + 42);
  for (let i = 0; i < craterCount; i++) {
    const angle = crand() * Math.PI * 2, r = crand() * (pr - 5) + 2;
    const cpx = Math.round(cx + Math.cos(angle) * r * 0.65), cpy = Math.round(cy + Math.sin(angle) * r * 0.6);
    const cr = 1 + Math.floor(crand() * 2);
    g.fillStyle = '#000'; g.globalAlpha = 0.45; g.fillRect(cpx-cr, cpy-cr, cr*2+1, cr*2+1);
    g.fillStyle = '#fff'; g.globalAlpha = 0.15; g.fillRect(cpx-cr, cpy-cr, cr, cr); g.globalAlpha = 1;
  }
  for (let py = cy-pr-1; py <= cy+pr+1; py++) {
    for (let px = cx-pr-1; px <= cx+pr+1; px++) {
      const dx = px-cx, dy = py-cy, dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < pr || dist > pr+1.8) continue;
      g.fillStyle = cols[0]; g.globalAlpha = 0.12; g.fillRect(px, py, 1, 1); g.globalAlpha = 1;
    }
  }
  if (portfolio.nfts.length > 5) {
    const mr = 5, mx2 = cx+pr+13, my2 = cy-pr+6;
    for (let py = my2-mr; py <= my2+mr; py++) for (let px = mx2-mr; px <= mx2+mr; px++) {
      const dx=px-mx2, dy=py-my2;
      if (Math.sqrt(dx*dx+dy*dy) > mr) continue;
      const r = mkRand((px*17+py*23+seed)|0);
      g.fillStyle = r() > 0.5 ? '#c8c8c8' : '#aaaaaa';
      g.globalAlpha = Math.max(0.4, 0.9-dx*0.03-dy*0.04); g.fillRect(px, py, 1, 1); g.globalAlpha = 1;
    }
  }
  if (portfolio.nfts.length > 10) {
    const mr = 3, mx2 = cx-pr-9, my2 = cy+pr-10;
    for (let py = my2-mr; py <= my2+mr; py++) for (let px = mx2-mr; px <= mx2+mr; px++) {
      const dx=px-mx2, dy=py-my2;
      if (Math.sqrt(dx*dx+dy*dy) > mr) continue;
      const r = mkRand((px*13+py*19+seed+1)|0);
      g.fillStyle = r() > 0.5 ? '#d4a574' : '#b8845a';
      g.globalAlpha = 0.85; g.fillRect(px, py, 1, 1); g.globalAlpha = 1;
    }
  }
  const barW = 60, barX = cx - barW/2, barY = H - 6;
  g.fillStyle = '#fff'; g.globalAlpha = 0.1; g.fillRect(barX, barY, barW, 2);
  g.fillStyle = cols[0]; g.globalAlpha = 0.7; g.fillRect(barX, barY, Math.round(barW * score.total / 100), 2);
  g.globalAlpha = 1;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, W, H, 0, 0, W * SCALE, H * SCALE);
  return ptype.name;
};

const CONTRACT = 'SP1GVG84HRYCBYEW59M0S4XGQF8TTVXRF8XNXGBMH.stacks-folio-galaxy';

const WalletPixelPlanet: React.FC<Props> = ({ portfolio, score, address }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [planetName, setPlanetName] = useState('');
  const [minting, setMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'success' | 'error' | 'already'>('idle');
  const [mintMsg, setMintMsg] = useState('');

  useEffect(() => {
    if (!canvasRef.current) return;
    const name = drawPlanet(canvasRef.current, portfolio, score);
    setPlanetName(name);
  }, [portfolio, score]);

  const handleDownload = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement('a');
    link.download = `stacks-planet-${address.slice(0, 8)}.png`;
    link.href = canvas.toDataURL('image/png'); link.click();
  };

  const handleMint = async () => {
    setMinting(true); setMintStatus('idle'); setMintMsg('');
    try {
      const { request } = await import('@stacks/connect');
      await request('stx_callContract', {
        contract: CONTRACT,
        functionName: 'mint',
        functionArgs: [],
        network: 'mainnet',
      });
      setMintStatus('success');
    } catch (e: any) {
      if (e.message?.includes('cancel') || e.message?.includes('abort')) {
        setMintStatus('idle');
      } else if (e.message?.includes('409') || e.message?.includes('already') || e.message?.includes('u409')) {
        setMintStatus('already');
      } else {
        setMintStatus('error');
        setMintMsg('Mint failed. Try again.');
      }
    } finally { setMinting(false); }
  };

  const hasRings = portfolio.stacking.stacked || score.total > 60;
  const nftCount = portfolio.nfts.length;
  const gammaUrl = `https://gamma.io/collections/${CONTRACT}`;
  const leatherUrl = `https://leather.io/activity`;

  const PostMintButtons = () => (
    <div className="flex gap-2">
      <a href={leatherUrl} target="_blank" rel="noreferrer"
        className="flex-1 bg-white text-black text-center py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-white/80 transition-colors">
        View in Wallet
      </a>
      <a href={gammaUrl} target="_blank" rel="noreferrer"
        className="flex-1 bg-[#FF9900] text-black text-center py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#ffb03a] transition-colors">
        Sell on Gamma
      </a>
    </div>
  );

  return (
    <div className="bg-[#050510] border border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-white/30">Wallet Planet</p>
        <p className="text-[10px] text-white/20 font-mono">Unique to your wallet</p>
      </div>

      <div className="flex justify-center">
        <canvas ref={canvasRef} width={320} height={320} style={{ imageRendering: 'pixelated' }} className="rounded-sm" />
      </div>

      {planetName && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{planetName}</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-xs font-mono text-white/40">{score.total}/100</span>
          {hasRings && <><span className="text-white/20 text-xs">·</span><span className="text-xs font-mono text-white/40">Rings</span></>}
          {nftCount > 5 && <><span className="text-white/20 text-xs">·</span><span className="text-xs font-mono text-white/40">{nftCount > 10 ? '2 moons' : '1 moon'}</span></>}
        </div>
      )}

      <p className="text-[10px] text-center text-white/15 font-mono">
        Type from score · craters from txns · moons from NFTs · rings from stacking
      </p>

      {mintStatus === 'idle' && (
        <div className="flex gap-2">
          <button onClick={handleDownload}
            className="flex-1 border border-white/20 text-white/60 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-white/40 hover:text-white transition-colors">
            Download
          </button>
          <button onClick={handleMint} disabled={minting}
            className="flex-1 bg-[#FF9900] text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#ffb03a] transition-colors disabled:opacity-50">
            {minting ? 'Minting...' : 'Mint as NFT'}
          </button>
        </div>
      )}

      {mintStatus === 'success' && (
        <div className="space-y-2">
          <p className="text-xs text-center font-mono text-green-400 pb-1">Planet minted! 🪐</p>
          <PostMintButtons />
        </div>
      )}

      {mintStatus === 'already' && (
        <div className="space-y-2">
          <p className="text-xs text-center font-mono text-white/30 pb-1">Already minted — 1 per wallet</p>
          <PostMintButtons />
        </div>
      )}

      {mintStatus === 'error' && (
        <div className="space-y-2">
          <p className="text-xs text-center font-mono text-red-400">{mintMsg}</p>
          <button onClick={() => setMintStatus('idle')}
            className="w-full border border-white/20 text-white/60 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-white/40 hover:text-white transition-colors">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletPixelPlanet;
