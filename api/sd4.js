import { withCors } from './_cors.js';
import { supabase } from '../db.js';

const SD4_CODES = [
  "BY","BZ","CA","CB","CC","CD","CE",
  "CF","CG","CH","CI","CJ","CK","CL",
  "CM","CN","CO","CP","CQ","CR","CS",
  "CT","CU","CV","CW","CX","CY","CZ"
];
const FORCAS_CODES = [
  "DU","DV","DW","EB","EC","EE",
  "DS","DT","DX","DY","DZ","ED","EF","EG","EH","EI","EJ","EK"
];
const SUBSTANCIAS_CODES = [
  "Q1","AA1","AK1","AU1","BE1","BO1",
  "P1","Z1","AJ1","AT1","BD1","BN1",
  "R1","AB1","AL1","AV1","BF1","BP1",
  "S1","AC1","AM1","AW1","BG1","BQ1",
  "T1","AD1","AN1","AX1","BH1","BR1",
  "U1","AE1","AO1","AY1","BI1","BS1",
  "V1","AF1","AP1","AZ1","BJ1","BT1",
  "W1","AG1","AQ1","BA1","BL1","BU1",
  "X1","AH1","AR1","BB1","BM1","BV1",
  "BX1"
];
const BIG5_CODES = ["big1","big2","big3","big4","big5","big6","big7","big8","big9","big10"];

const THRESHOLDS = {
  maquiavelismo: [17, 27],
  narcisismo: [13, 23],
  psicopatia: [8, 19],
  sadismo: [11, 23],
  fatorGeral: [49, 92]
};

const MENSAGENS = {
  maquiavelismo: {
    Baixo: "Você tende a ser direto e transparente, valorizando a sinceridade nas relações. Isso fortalece vínculos de confiança, embora possa dificultar em ambientes muito competitivos.",
    Médio: "Você demonstra equilíbrio entre sinceridade e estratégia, conseguindo negociar e se posicionar sem recorrer excessivamente à manipulação.",
    Alto: "Você tende a usar estratégias de influência para atingir objetivos. Isso pode ser útil em negociações e liderança, mas é importante refletir sobre como esse estilo impacta a confiança e as relações interpessoais."
  },
  narcisismo: {
    Baixo: "Você tende a ter uma postura modesta, podendo até apresentar insegurança em alguns momentos. Esse estilo favorece a humildade, mas pode limitar a autovalorização.",
    Médio: "Você apresenta uma autoestima equilibrada, com busca saudável por reconhecimento e confiança em suas capacidades.",
    Alto: "Você demonstra alta autoconfiança e desejo de destaque. Isso pode impulsionar conquistas, mas também merece atenção para lidar com críticas e valorizar as necessidades dos outros."
  },
  psicopatia: {
    Baixo: "Você valoriza a empatia, evita riscos excessivos e tende a respeitar normas sociais, favorecendo relações mais seguras e confiáveis.",
    Médio: "Você equilibra assertividade e sensibilidade, conseguindo lidar com situações difíceis sem perder totalmente a preocupação ética.",
    Alto: "Você demonstra maior impulsividade e tolerância ao risco. Isso pode favorecer decisões rápidas e firmes, mas também exige atenção ao controle emocional e às consequências das ações."
  },
  sadismo: {
    Baixo: "Você evita causar sofrimento ou desconforto e valoriza interações respeitosas, priorizando vínculos colaborativos.",
    Médio: "Você consegue lidar com situações competitivas sem buscar prazer em prejudicar outras pessoas, equilibrando firmeza e respeito.",
    Alto: "Você tende a se sentir fortalecido em contextos de confronto ou dominação. Esse estilo pode apoiar liderança firme, mas exige cautela para não gerar agressividade ou prejuízos a outros."
  },
  fatorGeral: {
    Baixo: "Seu perfil indica estilo interpessoal cooperativo e empático, voltado para a colaboração e o respeito mútuo.",
    Médio: "Você apresenta traços estratégicos dentro de níveis típicos. Esse equilíbrio pode ser funcional em diferentes contextos sociais e profissionais.",
    Alto: "Seu perfil sugere maior competitividade e pragmatismo, o que pode fortalecer a liderança em alguns ambientes. Ao mesmo tempo, requer atenção para manter a autorregulação e preservar a confiança nas relações."
  }
};

const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const sumItems = (respostas, items) => {
  let sum = 0; let count = 0;
  for (const code of items) {
    const v = respostas[code] ?? respostas[code.toLowerCase()] ?? respostas[code.toUpperCase()];
    const n = toNumber(v);
    if (n !== null) { sum += n; count++; }
  }
  return { sum, count };
};

const interpretScore = (factorKey, score) => {
  const thr = THRESHOLDS[factorKey];
  if (!thr) return { category: "Indeterminado", message: "" };
  const [lowMax, midMax] = thr;
  let category = "Alto";
  if (score <= lowMax) category = "Baixo";
  else if (score <= midMax) category = "Médio";
  const message = MENSAGENS[factorKey] ? MENSAGENS[factorKey][category] ?? "" : "";
  return { category, message };
};

function mapFrontToPlanilha(respostasFront) {
  const respostas = {};
  SD4_CODES.forEach((code, idx) => { const v = respostasFront[`q${idx + 1}`]; if (v !== undefined) respostas[code] = v; });
  FORCAS_CODES.forEach((code, idx) => { const v = respostasFront[`q7_${idx + 1}`]; if (v !== undefined) respostas[code] = v; });
  SUBSTANCIAS_CODES.forEach((code) => { if (respostasFront[code] !== undefined) respostas[code] = respostasFront[code]; });
  BIG5_CODES.forEach((code) => { if (respostasFront[code] !== undefined) respostas[code] = respostasFront[code]; });
  const possibleKeys = ["idade","genero","cor","escolaridade","area","estadoCivil","renda","diagnostico","diagnosticoDetalhe","crime","crimeDetalhe","substancias","substanciasSelecionadas","outrasSubstanciasDetalhe"];
  possibleKeys.forEach((k) => { if (respostasFront[k] !== undefined) respostas[k] = respostasFront[k]; });
  return respostas;
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' });
  try {
    const { nome = null, email = null, consent = false, respostas: respostasFront = {} } = req.body || {};
    const respostas = mapFrontToPlanilha(respostasFront);

    const scores = {}; const categories = {};
    const calcFactor = (key, items) => {
      const { sum, count } = sumItems(respostas, items);
      scores[key] = { raw: sum, answeredItems: count, possibleItems: items.length };
      categories[key] = interpretScore(key, sum);
    };
    calcFactor('maquiavelismo', SD4_CODES.slice(0, 7));
    calcFactor('narcisismo', SD4_CODES.slice(7, 14));
    calcFactor('psicopatia', SD4_CODES.slice(14, 21));
    calcFactor('sadismo', SD4_CODES.slice(21, 28));

    const geralSum = sumItems(respostas, SD4_CODES);
    scores.fatorGeral = { raw: geralSum.sum, answeredItems: geralSum.count, possibleItems: SD4_CODES.length };
    categories.fatorGeral = interpretScore('fatorGeral', geralSum.sum);

    const intrap = sumItems(respostas, FORCAS_CODES.slice(0, 6));
    const inte = sumItems(respostas, FORCAS_CODES.slice(6));
    scores.forcas_intrapessoais = { raw: intrap.sum, answeredItems: intrap.count, possibleItems: 6 };
    scores.forcas_intelectuais_interp = { raw: inte.sum, answeredItems: inte.count, possibleItems: FORCAS_CODES.slice(6).length };

    const substGroups = [
      { key: 'alcool', len: 6 }, { key: 'tabaco', len: 6 }, { key: 'maconha', len: 6 },
      { key: 'cocaina', len: 6 }, { key: 'anfetaminas', len: 6 }, { key: 'inalantes', len: 6 },
      { key: 'hipnoticos_sedativos', len: 6 }, { key: 'alucinogenos', len: 6 }, { key: 'opioides', len: 6 },
      { key: 'uso_injetavel', len: 1 }
    ];
    const substanciasScores = {}; let idx = 0;
    for (const g of substGroups) {
      const slice = SUBSTANCIAS_CODES.slice(idx, idx + g.len);
      const r = sumItems(respostas, slice);
      substanciasScores[g.key] = { raw: r.sum, answeredItems: r.count, possibleItems: g.len };
      idx += g.len;
    }
    scores.substancias = substanciasScores;

    const big5 = sumItems(respostas, BIG5_CODES);
    scores.big5_total = { raw: big5.sum, answeredItems: big5.count, possibleItems: BIG5_CODES.length };

    const summaryText = [
      categories.maquiavelismo?.message || '',
      categories.narcisismo?.message || '',
      categories.psicopatia?.message || '',
      categories.sadismo?.message || '',
      categories.fatorGeral?.message || ''
    ].filter(Boolean).join('\\n\\n');

    const payload = { nome, email, consent: Boolean(consent), respostas, scores, categories };
    const { data: insertData, error: insertError, status } = await supabase
      .from('respostas')
      .insert([payload])
      .select('id, created_at')
      .single();
    if (insertError) return res.status(status || 500).json({ ok: false, message: 'Erro ao salvar respostas' });

    return res.status(200).json({ ok: true, message: 'Respostas recebidas e calculadas', id: insertData.id, created_at: insertData.created_at, scores, categories, summaryText });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Erro interno', error: err.message });
  }
}

export default withCors(handler);
