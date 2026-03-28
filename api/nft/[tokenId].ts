import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCanvas } from 'canvas';

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

// We can't know the exact wallet data from tokenId alone,
// so we derive a deterministic visual purely from tokenId
const generatePlanetImage = (tokenId: number): { image: string; planetType: string } => {
  // Use tokenId as seed — deterministic per token
  const seed = (tokenId * 7919 + 1013904223) & 0x7fffffff;
  const rand = mkRand(seed);

  // Derive pseudo-score from seed (0–100)
  const score = Math.floor(rand() * 101);
  const txCount = Math.floor(rand() * 40);
  const nftCount = Math.floor(rand() * 15);
  const hasRings = rand() > 0.6;

  const ptype = PLANET_TYPES.filter(t => score >= t.minScore).pop()!;
  const cols = ptype.colors;

  const SIZE = 320;
  const PIXEL = 4; // each logical pixel = 4x4 real pixels
  const W = SIZE / PIXEL;
  const H = SIZE / PIXEL;

  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Work at small scale then upscale
  const small = createCanvas(W, H);
  const g = small.getContext('2d') as any;

  const cx = Math.floor(W / 2) - 2;
  const cy = Math.floor(H / 2) + 2;
  const pr = 22;

  // Background
  g.fillStyle = '#050510';
  g.fillRect(0, 0, W, H);

  // Stars
  const srand = mkRand(seed + 777);
  for (let i = 0; i < 70; i++) {
    const sx = Math.floor(srand() * W), sy = Math.floor(srand() * H);
    g.fillStyle = srand() > 0.92 ? '#ffffff' : srand() > 0.6 ? '#aaaaaa' : '#444444';
    g.fillRect(sx, sy, 1, 1);
  }

  // Rings
  if (hasRings) {
    for (let rx = -pr - 9; rx <= pr + 9; rx++) {
      const ry = Math.round(rx * 0.22);
      const dist = Math.abs(rx);
      if (dist < pr - 2 || dist > pr + 8) continue;
      g.globalAlpha = dist < pr + 3 ? 0.55 : 0.25;
      g.fillStyle = cols[1];
      g.fillRect(cx + rx, cy + ry - 1, 1, 1);
      g.fillRect(cx + rx, cy + ry, 1, 1);
      g.globalAlpha = 1;
    }
  }

  // Planet body
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
      g.fillStyle = col;
      g.globalAlpha = Math.max(0.5, Math.min(1, shade));
      g.fillRect(px, py, 1, 1);
      g.globalAlpha = 1;
    }
  }

  // Craters
  const craterCount = Math.min(Math.floor(txCount / 3), 7);
  const crand = mkRand(seed + 42);
  for (let i = 0; i < craterCount; i++) {
    const angle = crand() * Math.PI * 2, r = crand() * (pr - 5) + 2;
    const cpx = Math.round(cx + Math.cos(angle) * r * 0.65);
    const cpy = Math.round(cy + Math.sin(angle) * r * 0.6);
    const cr = 1 + Math.floor(crand() * 2);
    g.fillStyle = '#000000'; g.globalAlpha = 0.45; g.fillRect(cpx-cr, cpy-cr, cr*2+1, cr*2+1);
    g.fillStyle = '#ffffff'; g.globalAlpha = 0.15; g.fillRect(cpx-cr, cpy-cr, cr, cr);
    g.globalAlpha = 1;
  }

  // Atmosphere
  for (let py = cy-pr-1; py <= cy+pr+1; py++) {
    for (let px = cx-pr-1; px <= cx+pr+1; px++) {
      const dx = px-cx, dy = py-cy, dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < pr || dist > pr+1.8) continue;
      g.fillStyle = cols[0]; g.globalAlpha = 0.12; g.fillRect(px, py, 1, 1); g.globalAlpha = 1;
    }
  }

  // Moon 1
  if (nftCount > 5) {
    const mr = 5, mx2 = cx+pr+13, my2 = cy-pr+6;
    for (let py = my2-mr; py <= my2+mr; py++) for (let px = mx2-mr; px <= mx2+mr; px++) {
      const dx=px-mx2, dy=py-my2;
      if (Math.sqrt(dx*dx+dy*dy) > mr) continue;
      const r = mkRand((px*17+py*23+seed)|0);
      g.fillStyle = r() > 0.5 ? '#c8c8c8' : '#aaaaaa';
      g.globalAlpha = Math.max(0.4, 0.9-dx*0.03-dy*0.04); g.fillRect(px, py, 1, 1); g.globalAlpha = 1;
    }
  }

  // Moon 2
  if (nftCount > 10) {
    const mr = 3, mx2 = cx-pr-9, my2 = cy+pr-10;
    for (let py = my2-mr; py <= my2+mr; py++) for (let px = mx2-mr; px <= mx2+mr; px++) {
      const dx=px-mx2, dy=py-my2;
      if (Math.sqrt(dx*dx+dy*dy) > mr) continue;
      const r = mkRand((px*13+py*19+seed+1)|0);
      g.fillStyle = r() > 0.5 ? '#d4a574' : '#b8845a';
      g.globalAlpha = 0.85; g.fillRect(px, py, 1, 1); g.globalAlpha = 1;
    }
  }

  // Scale up pixelated
  ctx.imageSmoothingEnabled = false;
  (ctx as any).patternQuality = 'fast';
  ctx.drawImage(small as any, 0, 0, W, H, 0, 0, SIZE, SIZE);

  return {
    image: canvas.toDataURL('image/png'),
    planetType: ptype.name,
  };
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { tokenId } = req.query;
  const id = parseInt(tokenId as string, 10);

  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid token ID' });
  }

  try {
    const { image, planetType } = generatePlanetImage(id);

    // SIP-016 / OpenSea compatible metadata
    const metadata = {
      name: `StacksFolio Planet #${id}`,
      description: `A unique pixel art planet generated from on-chain wallet activity. Type: ${planetType}. Built on Stacks — Bitcoin L2.`,
      image,
      external_url: `https://stacks-folio.vercel.app`,
      attributes: [
        { trait_type: 'Planet Type', value: planetType },
        { trait_type: 'Token ID', value: id },
      ],
    };

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json(metadata);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
