const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export default async function handler(req, res) {
  if (!APPS_SCRIPT_URL) return res.status(500).json({ok:false,error:'APPS_SCRIPT_URL belum diset.'});
  const action = req.query.action || req.body?.action || '';
  if (!action) return res.status(400).json({ok:false,error:'Action diperlukan.'});
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set('action', action);

  try {
    let response;
    if (req.method === 'GET') {
      Object.entries(req.query || {}).forEach(([k,v]) => { if(k !== 'action' && v !== undefined) url.searchParams.set(k,String(v)); });
      response = await fetch(url.toString(), {method:'GET',redirect:'follow'});
    } else {
      response = await fetch(url.toString(), {
        method:'POST',
        redirect:'follow',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...req.body, action})
      });
    }
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(502).json({ok:false,error:'Response Apps Script bukan JSON.',raw:text.slice(0,500)}); }
    return res.status(response.ok ? 200 : 502).json(data);
  } catch (e) {
    return res.status(500).json({ok:false,error:e.message || String(e)});
  }
}
