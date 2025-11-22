const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lê cartão/ficha de consulta (imagem)
async function extrairConsultaDeImagem(imageUrl) {
  const prompt = `
Você é um sistema que lê cartões de agendamento do SUS.
Extraia apenas os campos abaixo em JSON:

{
  "tipo_consulta": "clinico_geral | cardiologia | ortopedia | ...",
  "data": "YYYY-MM-DD",
  "hora": "HH:MM",
  "local": "nome da unidade",
  "observacoes": "texto curto se houver"
}
Se não souber algum campo, deixe como string vazia.
`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Você extrai dados estruturados de imagens de cartões de consulta." },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  return JSON.parse(resp.choices[0].message.content);
}

// Extrai consulta a partir de TEXTO (voz já transcrita)
async function extrairConsultaDeTexto(texto) {
  const prompt = `
Mensagem: "${texto}"

Extraia os dados da consulta no JSON:

{
  "tipo_consulta": "...",
  "data": "YYYY-MM-DD ou vazio",
  "hora": "HH:MM ou vazio",
  "local": "local ou vazio",
  "observacoes": "texto curto"
}
`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Você extrai dados estruturados de pedidos de consulta." },
      { role: "user", content: prompt },
    ],
  });

  return JSON.parse(resp.choices[0].message.content);
}

// Lê receita médica
async function extrairReceitaDeImagem(imageUrl) {
  const prompt = `
Você é um sistema que lê receitas médicas.
Retorne JSON no formato:

{
  "medicamentos": [
    {
      "nome": "",
      "dosagem": "",
      "frequencia": "",
      "duracao": "",
      "horarios": ["08:00", "20:00"],
      "observacoes": ""
    }
  ]
}
`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Você organiza receitas médicas em JSON para leigos." },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  return JSON.parse(resp.choices[0].message.content);
}

module.exports = {
  extrairConsultaDeImagem,
  extrairConsultaDeTexto,
  extrairReceitaDeImagem,
};
