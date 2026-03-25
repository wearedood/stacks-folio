export interface Env { GEMINI_API_KEY: string; }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    try {
      const body = await request.json() as any;
      const prompt = body.prompt;
      if (!prompt) return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + env.GEMINI_API_KEY;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 300, temperature: 0.9 } }),
      });
      const d = await r.json() as any;
      const text = d?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return new Response(JSON.stringify({ text }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message ?? 'Unknown error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  },
};
