import { withCors } from './_cors.js';

function handler(req, res) {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
}

export default withCors(handler);

