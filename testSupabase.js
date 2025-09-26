import 'dotenv/config'; 
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const fetchData = async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/respostas`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error('Erro ao buscar dados do Supabase:', err);
  }
};

fetchData();
