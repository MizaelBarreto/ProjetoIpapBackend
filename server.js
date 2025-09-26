import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./db.js";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* ------------------------------
   MAPEAMENTOS / CONSTANTES
   ------------------------------ */
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
    Baixo: "Você tende a ser direto e transparente; mantém relações estáveis.",
    Médio: "Equilíbrio entre sinceridade e estratégia.",
    Alto: "Tende a usar estratégias de influência; atenção em relações interpessoais."
  },
  narcisismo: {
    Baixo: "Você tende a ter postura modesta; boa cooperação.",
    Médio: "Autoestima equilibrada; busca saudável por reconhecimento.",
    Alto: "Alta autoconfiança; atenção ao equilíbrio com empatia."
  },
  psicopatia: {
    Baixo: "Prioriza empatia e normas sociais.",
    Médio: "Equilíbrio entre assertividade e sensibilidade.",
    Alto: "Maior impulsividade; atenção ao controle emocional."
  },
  sadismo: {
    Baixo: "Respeito por vínculos; evita causar sofrimento.",
    Médio: "Consegue competir sem prejudicar os outros.",
    Alto: "Tendência a comportamentos que podem ferir — cautela."
  },
  fatorGeral: {
    Baixo: "Estilo cooperativo e empático.",
    Médio: "Traços estratégicos moderados.",
    Alto: "Maior competitividade e pragmatismo."
  }
};

const perguntasMap = {
  idade: "Idade",
  genero: "Gênero que se identifica",
  cor: "Cor",
  escolaridade: "Nível Educacional",
  area: "Área de formação (se Ensino Superior)",
  estadoCivil: "Estado Civil",
  renda: "Renda Familiar Mensal",
  diagnostico: "Recebeu diagnóstico clínico psicológico, psiquiátrico ou neurológico?",
  diagnosticoDetalhe: "Qual diagnóstico?",
  crime: "Já foi acusado de algum crime?",
  crimeDetalhe: "Qual crime?",
  substancias: "Você já usou alguma substância sem prescrição médica?",
  outrasSubstanciasDetalhe: "Outras substâncias (especificar)",
  q1: "Não acho inteligente deixar as pessoas conhecerem os meus segredos.",
  q2: "Acredito que as pessoas devem fazer o que for preciso para ganhar o apoio de pessoas importantes.",
  q3: "Evito conflito direto com as pessoas porque elas podem me ser úteis no futuro.",
  q4: "Acho que as pessoas devem se manter reservadas se quiserem alcançar seus objetivos.",
  q5: "Acredito que para manipular uma situação é necessário planejamento.",
  q6: "Bajulação é uma boa maneira de conquistar as pessoas para o seu lado.",
  q7: "Adoro quando um plano feito com 'jeitinho' tem sucesso.",
  q8: "As pessoas me vêem como uma pessoa que lidera com facilidade.",
  q9: "Eu tenho um talento para convencer as pessoas.",
  q10: "Atividades em grupo geralmente são chatas se eu não estiver presente.",
  q11: "Sei que sou especial porque as pessoas sempre me dizem isso.",
  q12: "Tenho algumas qualidades extraordinárias.",
  q13: "É provável que no futuro eu seja famoso em alguma área.",
  q14: "Gosto de me exibir de vez em quando.",
  q15: "As pessoas frequentemente dizem que eu estou descontrolado.",
  q16: "Tenho a tendência de bater de frente com as autoridades, desrespeitando suas regras.",
  q17: "Já me envolvi em mais conflitos do que a maioria das pessoas da minha idade e gênero.",
  q18: "Eu tenho a tendência de fazer primeiro e pensar depois.",
  q19: "Já tive problemas com a justiça.",
  q20: "Às vezes, me envolvo em situações perigosas.",
  q21: "As pessoas que me causam problemas sempre se arrependem.",
  q22: "Gosto de assistir uma briga de rua.",
  q23: "Gosto muito de assistir filmes e esportes violentos.",
  q24: "Acho engraçado quando pessoas babacas se dão mal.",
  q25: "Gosto de jogar videogames/jogos violentos.",
  q26: "Acho que algumas pessoas merecem sofrer.",
  q27: "Já disse coisas maldosas na internet só por diversão.",
  q28: "Sei como machucar as pessoas somente com palavras.",
  q7_1: "Fui propositalmente maldoso(a) com outras pessoas no ensino médio.",
  q7_2: "Gosto de machucar fisicamente as pessoas.",
  q7_3: "Já dominei outras pessoas usando medo.",
  q7_4: "Às vezes dou replay em minhas cenas favoritas de filmes sangrentos de terror.",
  q7_5: "Gosto de fazer piadas às custas dos outros.",
  q7_6: "Em jogos de videogame, gosto do realismo dos jorros de sangue.",
  q7_7: "Já enganei alguém e ri quando pareceram tolos.",
  q7_8: "Gosto de atormentar pessoas.",
  q7_9: "Gosto de assistir lutas de ringue (MMA, UFC).",
  q7_10: "Eu gosto de machucar (ou fingir que vou machucar) meu parceiro(a) durante o sexo.",
  q7_11: "Eu gosto de ter o papel de vilão em jogos e torturar os outros personagens.",
  q7_12: "Quando tiro sarro de alguém, acho especialmente divertido se eles percebem.",
  q7_13: "Em corridas profissionais de carros, os acidentes são as partes que eu mais gosto.",
  q7_14: "Talvez eu não deveria, mas nunca me canso de zombar de alguns colegas.",
  q7_15: "Eu jamais humilharia alguém de propósito.",
  q7_16: "Eu tenho o direito de empurrar as pessoas.",
  q7_17: "Adoro assistir vídeos de pessoas brigando na internet.",
  q7_18: "Esportes são violentos demais.",
  q0_1: "Sei o que fazer para que as pessoas se sintam bem.",
  q0_2: "Sou competente para analisar problemas por diferentes ângulos.",
  q0_3: "Coisas boas me aguardam no futuro.",
  q0_4: "Consigo encontrar em minha vida motivos para ser grato(a).",
  q0_5: "Acredito em uma força sagrada que nos liga um ao outro.",
  q0_6: "Crio coisas úteis.",
  q0_7: "Sou uma pessoa verdadeira.",
  q0_8: "Consigo criar um bom ambiente nos grupos que trabalho.",
  q0_9: "Enfrento perigos para fazer o bem.",
  q0_10: "Sei admirar a beleza que existe no mundo.",
  q0_11: "Não perco as oportunidades que tenho para aprender coisas novas.",
  q0_12: "Sou uma pessoa que tem humildade.",
  q0_13: "Eu me sinto cheio(a) de vida.",
  q0_14: "Tenho facilidade para organizar trabalhos em grupos.",
  q0_15: "Consigo ajudar pessoas a se entenderem quando há uma discussão.",
  q0_16: "Tenho facilidade para fazer uma situação chata se tornar divertida.",
  q0_17: "Costumo tomar decisões quando estou ciente das consequências.",
  q0_18: "Sou uma pessoa justa.",
  big1: "É conversador, comunicativo.",
  big2: "Gosta de cooperar com os outros.",
  big3: "É original, tem sempre novas ideias.",
  big4: "É inventivo, criativo.",
  big5: "É prestativo e ajuda os outros.",
  big6: "Faz as coisas com eficiência.",
  big7: "É sociável, extrovertido.",
  big8: "É um trabalhador de confiança.",
  big9: "Fica tenso com frequência.",
  big10: "Fica nervoso facilmente."
};

/* HELPERS */
const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const sumItems = (respostas, items) => {
  let sum = 0;
  let count = 0;
  for (const code of items) {
    const v = respostas[code] ?? respostas[code.toLowerCase()] ?? respostas[code.toUpperCase()];
    const n = toNumber(v);
    if (n !== null) {
      sum += n;
      count++;
    }
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
  SD4_CODES.forEach((code, idx) => { respostas[code] = respostasFront[`q${idx + 1}`]; });
  FORCAS_CODES.forEach((code, idx) => { respostas[code] = respostasFront[`q7_${idx + 1}`]; });
  SUBSTANCIAS_CODES.forEach((code, idx) => { respostas[code] = respostasFront[`q0_${idx + 1}`]; });
  BIG5_CODES.forEach((code) => { respostas[code] = respostasFront[code]; });
  const possibleKeys = ["idade","genero","cor","escolaridade","area","estadoCivil","renda","diagnostico","diagnosticoDetalhe","crime","crimeDetalhe","substancias","outrasSubstanciasDetalhe"];
  possibleKeys.forEach((k) => { if (respostasFront[k] !== undefined) respostas[k] = respostasFront[k]; });
  return respostas;
}

/* Endpoints */

/* debug / mapping */
app.get("/api/mapping", (req, res) => {
  res.json({ sd4_codes: SD4_CODES, forcas_codes: FORCAS_CODES, substancias_codes: SUBSTANCIAS_CODES, big5_codes: BIG5_CODES, perguntasMap, thresholds: THRESHOLDS });
});

/* POST /api/sd4 */
app.post("/api/sd4", async (req, res) => {
  try {
    const { nome = null, email = null, consent = false, respostas: respostasFront = {} } = req.body;
    const respostas = mapFrontToPlanilha(respostasFront);

    const scores = {};
    const categories = {};

    const calcFactor = (key, items) => {
      const { sum, count } = sumItems(respostas, items);
      scores[key] = { raw: sum, answeredItems: count, possibleItems: items.length };
      categories[key] = interpretScore(key, sum);
    };

    calcFactor("maquiavelismo", SD4_CODES.slice(0,7));
    calcFactor("narcisismo", SD4_CODES.slice(7,14));
    calcFactor("psicopatia", SD4_CODES.slice(14,21));
    calcFactor("sadismo", SD4_CODES.slice(21,28));

    const geralSum = sumItems(respostas, SD4_CODES);
    scores.fatorGeral = { raw: geralSum.sum, answeredItems: geralSum.count, possibleItems: SD4_CODES.length };
    categories.fatorGeral = interpretScore("fatorGeral", geralSum.sum);

    const intrap = sumItems(respostas, FORCAS_CODES.slice(0,6));
    const inte = sumItems(respostas, FORCAS_CODES.slice(6));
    scores.forcas_intrapessoais = { raw: intrap.sum, answeredItems: intrap.count, possibleItems: 6 };
    scores.forcas_intelectuais_interp = { raw: inte.sum, answeredItems: inte.count, possibleItems: FORCAS_CODES.slice(6).length };

    const substanciasScores = {};
    const substGroups = [
      { key: "alcool", len: 6 },{ key: "tabaco", len: 6 },{ key: "maconha", len: 6 },
      { key: "cocaina", len: 6 },{ key: "anfetaminas", len: 6 },{ key: "inalantes", len: 6 },
      { key: "hipnoticos_sedativos", len: 6 },{ key: "alucinogenos", len: 6 },{ key: "opioides", len: 6 },
      { key: "uso_injetavel", len: 1 }
    ];
    let idx = 0;
    for (const g of substGroups) {
      const slice = SUBSTANCIAS_CODES.slice(idx, idx + g.len);
      const r = sumItems(respostas, slice);
      substanciasScores[g.key] = { raw: r.sum, answeredItems: r.count, possibleItems: g.len };
      idx += g.len;
    }
    scores.substancias = substanciasScores;

    const big5 = sumItems(respostas, BIG5_CODES);
    scores.big5_total = { raw: big5.sum, answeredItems: big5.count, possibleItems: BIG5_CODES.length };

    // 🔹 Monta o texto único com os resultados
    const summaryText = Object.entries(categories)
      .map(([key, value]) => {
        return `${key.charAt(0).toUpperCase() + key.slice(1)} (${value.category}): ${value.message}`;
      })
      .join(" ");

    // salvar via Supabase (service role key required)
    const payload = {
      nome,
      email,
      consent: Boolean(consent),
      respostas,
      scores,
      categories,
      summaryText // 🔹 salva também no banco
    };

    const { data: insertData, error: insertError, status } = await supabase
      .from("respostas")
      .insert([payload])
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(status || 500).json({ ok: false, message: "Erro ao salvar respostas" });
    }

    return res.json({
      ok: true,
      message: "Respostas recebidas e calculadas",
      id: insertData.id,
      created_at: insertData.created_at,
      scores,
      categories,
      summaryText // 🔹 retorna também para o frontend
    });
  } catch (err) {
    console.error("POST /api/sd4 error:", err);
    res.status(500).json({ ok: false, message: "Erro interno", error: err.message });
  }
});


/* GET /api/respostas */
app.get("/api/respostas", async (req, res) => {
  try {
    const { data, error, status } = await supabase
      .from("respostas")
      .select("id,nome,email,consent,respostas,scores,categories,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return res.status(status || 500).json({ ok: false, message: "Erro ao buscar respostas" });
    }
    return res.json(data ?? []);
  } catch (err) {
    console.error("GET /api/respostas error:", err);
    res.status(500).send("Erro ao buscar respostas");
  }
});

/* GET /api/export */
app.get("/api/export", async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from("respostas")
      .select("id,nome,email,respostas,scores,categories,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error (export):", error);
      return res.status(500).send("Erro ao exportar CSV");
    }

    const records = [];
    (rows || []).forEach((r) => {
      const respostasObj = r.respostas || {};
      const finalScore = (r.scores && r.scores.fatorGeral && typeof r.scores.fatorGeral.raw !== "undefined")
        ? r.scores.fatorGeral.raw
        : (r.scores && typeof r.scores.fatorGeral === "number" ? r.scores.fatorGeral : "");
      const finalCategory = (r.categories && r.categories.fatorGeral && r.categories.fatorGeral.category)
        ? r.categories.fatorGeral.category
        : "";

      Object.entries(respostasObj).forEach(([k, v]) => {
        records.push({
          nome: r.nome || "",
          email: r.email || "",
          pergunta: perguntasMap[k] || k,
          resposta: (typeof v === "object") ? JSON.stringify(v) : String(v ?? ""),
          resultado_num: finalScore,
          resultado_cat: finalCategory,
          created_at: r.created_at
        });
      });
    });

    const filePath = path.join(process.cwd(), "export.csv");
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "nome", title: "Nome" },
        { id: "email", title: "Email" },
        { id: "pergunta", title: "Pergunta" },
        { id: "resposta", title: "Resposta" },
        { id: "resultado_num", title: "Resultado_Num" },
        { id: "resultado_cat", title: "Resultado_Categoria" },
        { id: "created_at", title: "Data" }
      ]
    });

    await csvWriter.writeRecords(records);
    res.download(filePath, "respostas_export.csv", (err) => {
      if (err) console.error("Erro ao baixar CSV:", err);
      try { fs.unlinkSync(filePath); } catch (e) {}
    });
  } catch (err) {
    console.error("GET /api/export error:", err);
    res.status(500).send("Erro ao exportar CSV");
  }
});

/* Health */
app.get("/api/ping", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

/* Start */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend rodando em http://localhost:${PORT}`));