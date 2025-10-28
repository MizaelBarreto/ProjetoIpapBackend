import { withCors } from './_cors.js';
import { supabase } from '../db.js';
import perguntasMap from '../perguntasMap.backend.js';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');
  const { data: rows, error } = await supabase
    .from('respostas')
    .select('id,nome,email,respostas,scores,categories,created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).send('Erro ao exportar CSV');

  const allKeys = new Set();
  (rows || []).forEach((r) => { Object.keys(r.respostas || {}).forEach((k) => allKeys.add(k)); });
  const header = [
    { id: 'nome', title: 'Nome' },
    { id: 'email', title: 'Email' },
    { id: 'created_at', title: 'Data' },
    ...Array.from(allKeys).sort().map((k) => ({ id: k, title: perguntasMap[k] || k })),
    { id: 'resultado_num', title: 'Resultado_Num' },
    { id: 'resultado_cat', title: 'Resultado_Categoria' }
  ];
  const records = (rows || []).map((r) => {
    const respostasObj = r.respostas || {};
    const finalScore = (r.scores && r.scores.fatorGeral && typeof r.scores.fatorGeral.raw !== 'undefined')
      ? r.scores.fatorGeral.raw
      : (r.scores && typeof r.scores.fatorGeral === 'number' ? r.scores.fatorGeral : '');
    const finalCategory = (r.categories && r.categories.fatorGeral && r.categories.fatorGeral.category)
      ? r.categories.fatorGeral.category
      : '';
    const rec = { nome: r.nome || '', email: r.email || '', created_at: r.created_at, resultado_num: finalScore, resultado_cat: finalCategory };
    Array.from(allKeys).forEach((k) => { const v = respostasObj[k]; rec[k] = (typeof v === 'object') ? JSON.stringify(v) : (v ?? ''); });
    return rec;
  });
  // Monta CSV em memória
  const esc = (s) => String(s ?? '').replace(/"/g, '""');
  const headerRow = header.map(h => `"${esc(h.title)}"`).join(',');
  const lines = [headerRow];
  for (const r of records) {
    const row = [
      `"${esc(r.nome)}"`,`"${esc(r.email)}"`,`"${esc(r.created_at)}"`,
      ...Array.from(allKeys).sort().map(k => `"${esc(r[k])}"`),
      `"${esc(r.resultado_num)}"`,`"${esc(r.resultado_cat)}"`
    ].join(',');
    lines.push(row);
  }
  const csv = lines.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="respostas_export_wide.csv"');
  res.status(200).send(csv);
}

export default withCors(handler);
