const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

function parseBody(req) {
  if (!req.body) return {};

  if (typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return {};
}

export default async function handler(req, res) {
  try {
    if (!APPS_SCRIPT_URL) {
      return res.status(500).json({
        ok: false,
        error: 'APPS_SCRIPT_URL belum diset di Vercel.'
      });
    }

    const body = parseBody(req);

    const action =
      req.query?.action ||
      body.action ||
      '';

    if (!action) {
      return res.status(400).json({
        ok: false,
        error: 'Action diperlukan.'
      });
    }

    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set('action', action);

    let response;

    if (req.method === 'GET') {
      Object.entries(req.query || {}).forEach(([key, value]) => {
        if (key !== 'action' && value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });

      response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow'
      });

    } else {

      const forwardBody = {
        ...body,
        action: action
      };

      response = await fetch(url.toString(), {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forwardBody)
      });
    }

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return res.status(502).json({
        ok: false,
        error: 'Response Apps Script bukan JSON.',
        raw: text.substring(0, 1000)
      });
    }

    return res.status(200).json(data);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error.message || String(error)
    });
  }
}
