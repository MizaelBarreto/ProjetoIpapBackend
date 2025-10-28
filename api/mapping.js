import { withCors } from './_cors.js';

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

function handler(req, res) {
  res.status(200).json({ sd4_codes: SD4_CODES, forcas_codes: FORCAS_CODES, substancias_codes: SUBSTANCIAS_CODES, big5_codes: BIG5_CODES });
}

export default withCors(handler);

