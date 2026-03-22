import React, { useEffect, useRef } from 'react';
import { PortfolioData } from '../services/stacksService';

interface Props {
  portfolio: PortfolioData;
}

const WalletFingerprint: React.FC<Props> = ({ portfolio }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Seed values from wallet data
    const seed = [
      portfolio.stxBalance,
      portfolio.totalReceived,
      portfolio.totalSent,
      portfolio.nfts.length,
      portfolio.transactionCount,
      portfolio.stacking.amountStacked,
    ];

    const rings = 8;
    const points = 12;

    for (let r = 0; r < rings; r++) {
      const radius = 20 + r * (Math.min(W, H) / 2 - 25) / rings;
      const seedVal = seed[r % seed.length] || 1;
      const offset = (seedVal * (r + 1) * 0.3) % (Math.PI * 2);
      const amplitude = 4 + (seedVal % 12);

      ctx.beginPath();
      for (let p = 0; p <= points * 4; p++) {
        const angle = (p / (points * 4)) * Math.PI * 2 + offset;
        const noise = Math.sin(angle * (r + 2) + seedVal * 0.01) * amplitude;
        const noise2 = Math.cos(angle * (r + 3) + seedVal * 0.02) * (amplitude * 0.5);
        const rad = radius + noise + noise2;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad;
        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const alpha = 0.15 + (r / rings) * 0.5;
      // Color shifts from white to orange based on stacking
      const isStacking = portfolio.stacking.stacked;
      if (isStacking && r > rings / 2) {
        ctx.strokeStyle = `rgba(255, 153, 0, ${alpha})`;
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      }
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = portfolio.stacking.stacked ? '#FF9900' : '#ffffff';
    ctx.fill();

    // Address hash dots
    const addrBytes = portfolio.address.slice(2, 18);
    for (let i = 0; i < addrBytes.length; i++) {
      const char = addrBytes.charCodeAt(i);
      const angle = (i / addrBytes.length) * Math.PI * 2;
      const rad = 15 + (char % 8) * 8;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,0.6)`;
      ctx.fill();
    }
  }, [portfolio]);

  return (
    <div className="bg-white border border-black/8 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-black/30">Wallet Fingerprint</p>
        <p className="text-[10px] text-black/20 font-mono">Unique to your wallet</p>
      </div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-sm"
        />
      </div>
      <p className="text-[10px] text-center text-black/20 font-mono">
        Generated from your on-chain activity — no two wallets are the same
      </p>
    </div>
  );
};

export default WalletFingerprint;
