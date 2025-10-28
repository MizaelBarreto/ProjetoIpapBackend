import { withCors } from './_cors.js';
import { supabase } from '../db.js';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method not allowed' });
  const { data, error, status } = await supabase
    .from('respostas')
    .select('id,nome,email,consent,respostas,scores,categories,created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(status || 500).json({ ok: false, message: 'Erro ao buscar respostas' });
  res.status(200).json(data ?? []);
}

export default withCors(handler);

