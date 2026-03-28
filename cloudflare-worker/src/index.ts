export interface Env {
  GEMINI_API_KEY: string;
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
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    try {
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
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  },
};
