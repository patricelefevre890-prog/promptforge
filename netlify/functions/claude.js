exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: `Tu es un expert en ingénierie de prompts pour les IA comme Claude. Ton rôle est de transformer une demande simple en un prompt ultra-complet, précis et efficace.

Un prompt parfait doit contenir :
- Un rôle clair assigné à l'IA
- Le contexte détaillé
- La tâche précise avec toutes les nuances
- Le format de sortie attendu
- Le ton et le style souhaités
- Des exemples si pertinent
- Les contraintes à respecter

Génère UNIQUEMENT le prompt, sans explication ni introduction. Rédige en français.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: data.content[0].text })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
