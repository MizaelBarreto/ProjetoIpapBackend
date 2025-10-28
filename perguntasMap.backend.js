// Mapa de rótulos das perguntas para uso no backend (CSV wide)
// Conteúdo equivalente ao frontend, resumido quando aplicável

export const perguntasMap = {
  // Demográficas
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
  substanciasSelecionadas: "Substâncias selecionadas",
  outrasSubstanciasDetalhe: "Outras substâncias (especificar)",

  // SD4 q1..q28
  q1: "Não acho inteligente deixar as pessoas conhecerem meus segredos.",
  q2: "Fazer o necessário p/ apoio de pessoas importantes.",
  q3: "Evito conflito direto pensando no futuro.",
  q4: "Manter-se reservado para alcançar objetivos.",
  q5: "Manipular exige planejamento.",
  q6: "Bajulação conquista pessoas.",
  q7: "Gosto quando um plano com 'jeitinho' dá certo.",
  q8: "Lidero com facilidade.",
  q9: "Talento para convencer pessoas.",
  q10: "Grupo é chato se eu não estiver.",
  q11: "Dizem que sou especial.",
  q12: "Tenho qualidades extraordinárias.",
  q13: "Provável ser famoso no futuro.",
  q14: "Gosto de me exibir às vezes.",
  q15: "Dizem que estou descontrolado.",
  q16: "Bato de frente com autoridades.",
  q17: "Mais conflitos que maioria.",
  q18: "Faço primeiro, penso depois.",
  q19: "Já tive problemas com a justiça.",
  q20: "Às vezes me envolvo em perigos.",
  q21: "Quem me causa problema se arrepende.",
  q22: "Gosto de assistir briga de rua.",
  q23: "Gosto de filmes e esportes violentos.",
  q24: "Acho engraçado quando 'babacas' se dão mal.",
  q25: "Gosto de jogos violentos.",
  q26: "Algumas pessoas merecem sofrer.",
  q27: "Já disse coisas maldosas na internet.",
  q28: "Sei como machucar com palavras.",

  // Forças q7_1..q7_18 (resumido)
  q7_1: "Fui propositalmente maldoso(a) no ensino médio.",
  q7_2: "Gosto de machucar fisicamente.",
  q7_3: "Dominei outros usando medo.",
  q7_4: "Revejo cenas sangrentas de terror.",
  q7_5: "Piadas às custas de outros.",
  q7_6: "Realismo do sangue em jogos.",
  q7_7: "Enganei alguém e ri.",
  q7_8: "Gosto de atormentar pessoas.",
  q7_9: "Gosto de assistir lutas (MMA, UFC).",
  q7_10: "Machucar (ou fingir) parceiro(a) no sexo.",
  q7_11: "Vilão em jogos e torturar personagens.",
  q7_12: "Sarro é divertido quando percebem.",
  q7_13: "Acidentes são a parte que mais gosto.",
  q7_14: "Nunca me canso de zombar.",
  q7_15: "Jamais humilharia alguém (invertido).",
  q7_16: "Tenho direito de empurrar pessoas.",
  q7_17: "Gosto de vídeos de briga.",
  q7_18: "Esportes são violentos demais.",

  // Big5
  big1: "É conversador, comunicativo.",
  big2: "Gosta de cooperar.",
  big3: "É original, novas ideias.",
  big4: "É inventivo, criativo.",
  big5: "É prestativo e ajuda.",
  big6: "Faz as coisas com eficiência.",
  big7: "É sociável, extrovertido.",
  big8: "Trabalhador de confiança.",
  big9: "Fica tenso com frequência.",
  big10: "Fica nervoso facilmente.",

  // Substâncias (ASSIST)
  Q1: "Álcool - Frequência (3m)", AA1: "Álcool - Desejo", AK1: "Álcool - Problemas",
  AU1: "Álcool - Preocupação", BE1: "Álcool - Falhas", BO1: "Álcool - Reduzir",
  P1: "Tabaco - Frequência (3m)", Z1: "Tabaco - Desejo", AJ1: "Tabaco - Problemas",
  AT1: "Tabaco - Preocupação", BD1: "Tabaco - Falhas", BN1: "Tabaco - Reduzir",
  R1: "Maconha - Frequência (3m)", AB1: "Maconha - Desejo", AL1: "Maconha - Problemas",
  AV1: "Maconha - Preocupação", BF1: "Maconha - Falhas", BP1: "Maconha - Reduzir",
  S1: "Cocaína - Frequência (3m)", AC1: "Cocaína - Desejo", AM1: "Cocaína - Problemas",
  AW1: "Cocaína - Preocupação", BG1: "Cocaína - Falhas", BQ1: "Cocaína - Reduzir",
  T1: "Anfet/êxtase - Frequência (3m)", AD1: "Anfet/êxtase - Desejo", AN1: "Anfet/êxtase - Problemas",
  AX1: "Anfet/êxtase - Preocupação", BH1: "Anfet/êxtase - Falhas", BR1: "Anfet/êxtase - Reduzir",
  U1: "Inalantes - Frequência (3m)", AE1: "Inalantes - Desejo", AO1: "Inalantes - Problemas",
  AY1: "Inalantes - Preocupação", BI1: "Inalantes - Falhas", BS1: "Inalantes - Reduzir",
  V1: "Hipnóticos - Frequência (3m)", AF1: "Hipnóticos - Desejo", AP1: "Hipnóticos - Problemas",
  AZ1: "Hipnóticos - Preocupação", BJ1: "Hipnóticos - Falhas", BT1: "Hipnóticos - Reduzir",
  W1: "Alucinógenos - Frequência (3m)", AG1: "Alucinógenos - Desejo", AQ1: "Alucinógenos - Problemas",
  BA1: "Alucinógenos - Preocupação", BL1: "Alucinógenos - Falhas", BU1: "Alucinógenos - Reduzir",
  X1: "Opioides - Frequência (3m)", AH1: "Opioides - Desejo", AR1: "Opioides - Problemas",
  BB1: "Opioides - Preocupação", BM1: "Opioides - Falhas", BV1: "Opioides - Reduzir",
  BX1: "Uso injetável - Alguma vez na vida"
};

export default perguntasMap;

// Completa rótulos para códigos da planilha (BY..CZ, DU..EK) a partir dos rótulos base (q1.., q7_..)
(() => {
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

  SD4_CODES.forEach((code, idx) => {
    const qKey = `q${idx + 1}`;
    if (!(code in perguntasMap) && perguntasMap[qKey]) perguntasMap[code] = perguntasMap[qKey];
  });

  FORCAS_CODES.forEach((code, idx) => {
    const qKey = `q7_${idx + 1}`;
    if (!(code in perguntasMap) && perguntasMap[qKey]) perguntasMap[code] = perguntasMap[qKey];
  });
})();
