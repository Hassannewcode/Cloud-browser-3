export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.anchorbrowser.io/v1/sessions', {
      method: 'POST',
      headers: {
        'anchor-api-key': 'sk-b9bacac0d1a78a7e41db606c8992b425',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          timeout: {
            max_duration: 10,
            idle_timeout: 3
          }
        },
        browser: {
          headless: { active: false },
          viewport: { width: 1920, height: 1080 }
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json(data);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Request timeout' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}
