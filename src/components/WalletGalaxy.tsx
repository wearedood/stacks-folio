import React, { useEffect, useRef, useState } from 'react';
import { PortfolioData } from '../services/stacksService';
import { StacksScore } from '../services/scoreService';

interface Props {
  portfolio: PortfolioData;
  score: StacksScore;
  address: string;
}

const seededRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

const WalletGalaxy: React.FC<Props> = ({ portfolio, score, address }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [minting, setMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mintMsg, setMintMsg] = useState('');
  const timeRef = useRef(0);

  const seed = Math.abs(
    portfolio.stxBalance * 1000 + portfolio.totalReceived * 7 +
    portfolio.totalSent * 13 + portfolio.nfts.length * 97 +
    portfolio.transactionCount * 31 + score.total * 17
  ) | 0;

  const rand = seededRand(seed);
  const numStars = 40 + Math.min(portfolio.transactionCount * 2, 120);
  const stars = Array.from({ length: numStars }, (_, i) => {
    const phase = rand() * Math.PI * 2;
    const dist = Math.pow(rand(), 0.5);
    const hue = score.total > 70 ? 38 : score.total > 40 ? 200 : 260;
    return { orbitRadius: 20 + dist * 200, brightness: 0.3 + rand() * 0.7, size: 0.5 + rand() * 2.5, speed: 0.0002 + rand() * 0.0008, phase, hue, i };
  });

  const addrNums = address.slice(2, 14).split('').map(c => c.charCodeAt(0));
  const connections: [number, number][] = [];
  for (let i = 0; i < addrNums.length - 1; i++) {
    const a = addrNums[i] % stars.length;
    const b = addrNums[i + 1] % stars.length;
    if (a !== b) connections.push([a, b]);
  }

  const nftCount = Math.min(portfolio.nfts.length, 10);

  const draw = (canvas: HTMLCanvasElement, t: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width; const H = canvas.height;
    const cx = W / 2; const cy = H / 2;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    const coreColor = score.total > 70 ? '255,153,0' : score.total > 40 ? '100,180,255' : '160,100,255';
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.5);
    grad.addColorStop(0, `rgba(${coreColor},0.15)`);
    grad.addColorStop(0.5, `rgba(${coreColor},0.06)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const positions = stars.map(star => {
      const angle = star.phase + t * star.speed;
      const wobble = Math.sin(t * 0.001 * star.i + star.phase) * 3;
      return { x: cx + Math.cos(angle) * (star.orbitRadius + wobble) * 1.4, y: cy + Math.sin(angle) * (star.orbitRadius + wobble) * 0.7, ...star };
    });

    ctx.lineWidth = 0.5;
    connections.forEach(([a, b]) => {
      const pa = positions[a]; const pb = positions[b];
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${pa.hue},80%,70%,${0.08 + Math.sin(t * 0.002) * 0.04})`;
      ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    });

    positions.forEach((star, i) => {
      const twinkle = 0.7 + Math.sin(t * 0.003 * (i + 1) + star.phase) * 0.3;
      const alpha = star.brightness * twinkle;
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
      glow.addColorStop(0, `hsla(${star.hue},90%,85%,${alpha * 0.6})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${star.hue},60%,95%,${alpha})`; ctx.fill();
    });

    const nftRand = seededRand(seed + 999);
    for (let i = 0; i < nftCount; i++) {
      const angle = (i / nftCount) * Math.PI * 2 + t * 0.0003;
      const r = 30 + nftRand() * 40;
      const x = cx + Math.cos(angle) * r; const y = cy + Math.sin(angle) * r * 0.6;
      const pulse = 1 + Math.sin(t * 0.004 + i) * 0.3;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8 * pulse);
      g.addColorStop(0, 'rgba(255,200,50,0.9)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 8 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }

    const coreSize = 6 + (score.total / 100) * 10;
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 4);
    coreGlow.addColorStop(0, 'rgba(255,255,255,0.9)');
    coreGlow.addColorStop(0.2, `rgba(${coreColor},0.6)`);
    coreGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGlow; ctx.beginPath(); ctx.arc(cx, cy, coreSize * 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, coreSize, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();

    ctx.font = 'bold 11px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.textAlign = 'center';
    ctx.fillText(`${score.total}/100 · ${score.tier.toUpperCase()}`, cx, H - 14);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const animate = (t: number) => { timeRef.current = t; draw(canvas, t); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [portfolio, score]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    cancelAnimationFrame(animRef.current);
    draw(canvas, timeRef.current);
    const link = document.createElement('a');
    link.download = `stacks-galaxy-${address.slice(0, 8)}.png`;
    link.href = canvas.toDataURL('image/png'); link.click();
    const animate = (t: number) => { timeRef.current = t; draw(canvas, t); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
  };

  const handleMint = async () => {
    setMinting(true); setMintStatus('idle'); setMintMsg('');
    try {
      const { request } = await import('@stacks/connect');
      await request('stx_callContract', {
        contract: 'SP1GVG84HRYCBYEW59M0S4XGQF8TTVXRF8XNXGBMH.stacks-folio-galaxy',
        functionName: 'mint',
        functionArgs: [],
        network: 'mainnet',
      });
      setMintStatus('success'); setMintMsg('Galaxy minted! Check your wallet 🌌');
    } catch (e: any) {
      setMintStatus('error');
      setMintMsg(e.message?.includes('cancel') ? 'Cancelled.' : 'Mint failed. Try again.');
    } finally { setMinting(false); }
  };

  return (
    <div className="bg-[#050510] border border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-white/30">Wallet Galaxy</p>
        <p className="text-[10px] text-white/20 font-mono">Unique to your wallet</p>
      </div>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={320} height={320} className="rounded-sm" />
      </div>
      <p className="text-[10px] text-center text-white/20 font-mono">
        {numStars} stars · {nftCount} NFT cores · constellation from your address
      </p>
      <div className="flex gap-2">
        <button onClick={handleDownload} className="flex-1 border border-white/20 text-white/60 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-white/40 hover:text-white transition-colors">
          Download
        </button>
        <button onClick={handleMint} disabled={minting} className="flex-1 bg-[#FF9900] text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#ffb03a] transition-colors disabled:opacity-50">
          {minting ? 'Minting...' : 'Mint as NFT'}
        </button>
      </div>
      {mintStatus !== 'idle' && (
        <p className={`text-xs text-center font-mono ${mintStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>{mintMsg}</p>
      )}
    </div>
  );
};

export default WalletGalaxy;
