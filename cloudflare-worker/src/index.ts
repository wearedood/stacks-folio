export interface Env {
  GEMINI_API_KEY: string;
  LEADERBOARD: KVNamespace;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);

    if (url.pathname === '/leaderboard') {
      if (request.method === 'POST') {
        const entry = await request.json() as any;
        const stored = await env.LEADERBOARD.get('board');
        let board: any[] = stored ? JSON.parse(stored) : [];
        const idx = board.findIndex((e: any) => e.address === entry.address);
        if (idx >= 0) board[idx] = entry; else board.push(entry);
        board = board.sort((a: any, b: any) => b.score - a.score).slice(0, 50);
        await env.LEADERBOARD.put('board', JSON.stringify(board));
        return json(board);
      }
      if (request.method === 'GET') {
        const stored = await env.LEADERBOARD.get('board');
        return json(stored ? JSON.parse(stored) : []);
      }
    }

    if (request.method !== 'POST') return new Response('Not found', { status: 404, headers: cors });
    const body = await request.json() as { prompt: string };
    if (!body.prompt) return json({ error: 'Missing prompt' }, 400);
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
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
  },
};
