export interface Env {
  GEMINI_API_KEY: string;
  LEADERBOARD: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);

    // ── Leaderboard endpoint ──────────────────────────────────────────
    if (url.pathname === '/leaderboard') {
      if (request.method === 'POST') {
        try {
          const entry = await request.json() as {
            address: string; score: number; tier: string;
            tierColor: string; badges: number; timestamp: number;
          };

          // Load existing board
          const stored = await env.LEADERBOARD.get('board');
          let board: typeof[] = stored ? JSON.parse(stored) : [];

          // Upsert
          const idx = board.findIndex((e: any) => e.address === entry.address);
          if (idx >= 0) board[idx] = entry; else board.push(entry);

          // Sort + cap at 50
          board = board.sort((a: any, b: any) => b.score - a.score).slice(0, 50);
          await env.LEADERBOARD.put('board', JSON.stringify(board));

          return json(board);
        } catch (e: any) {
          return json({ error: e.message }, 500);
        }
      }

      if (request.method === 'GET') {
        const stored = await env.LEADERBOARD.get('board');
        return json(stored ? JSON.parse(stored) : []);
      }
    }

    // ── AI Roast endpoint ─────────────────────────────────────────────
    if (url.pathname === '/' || url.pathname === '') {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
      try {
        const body = await request.json() as { prompt: string };
        if (!body.prompt) return json({ error: 'Missing prompt' }, 400);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: body.prompt }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.9 },
            }),
          }
        );

        const data = await geminiRes.json() as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return json({ text });
      } catch (e: any) {
        return json({ error: e.message }, 500);
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
