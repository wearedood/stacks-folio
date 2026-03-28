import type { VercelRequest, VercelResponse } from '@vercel/node';

const PLANET_TYPES = [
  { name: 'Asteroid',  minScore: 0  },
  { name: 'Ice Moon',  minScore: 20 },
  { name: 'Rocky',     minScore: 35 },
  { name: 'Lava',      minScore: 55 },
  { name: 'Gas Giant', minScore: 70 },
  { name: 'Ocean',     minScore: 85 },
];

const mkRand = (seed: number) => {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { tokenId } = req.query;
  const id = parseInt(tokenId as string, 10);
  if (isNaN(id) || id < 1) return res.status(400).json({ error: 'Invalid token ID' });

  const seed = (id * 7919 + 1013904223) & 0x7fffffff;
  const rand = mkRand(seed);
  const score = Math.floor(rand() * 101);
  const ptype = PLANET_TYPES.filter(t => score >= t.minScore).pop()!;

  const BASE = 'https://stacks-folio.vercel.app';

  const metadata = {
    name: `StacksFolio Planet #${id}`,
    description: `A unique pixel art ${ptype.name} generated from on-chain wallet activity. Built on Stacks — Bitcoin L2.`,
    image: `${BASE}/api/nft/${id}/image`,
    external_url: BASE,
    attributes: [
      { trait_type: 'Planet Type', value: ptype.name },
      { trait_type: 'Token ID',    value: id },
    ],
  };

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json(metadata);
}
