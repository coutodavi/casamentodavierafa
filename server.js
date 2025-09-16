const express = require("express");
const fs = require("fs");
const path = require("path");
const { adicionarPresenca } = require("./googleSheets");
const mercadopago = require("mercadopago"); // ✅ apenas 1 vez

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Caminho do arquivo JSON local
const FAMILIAS_FILE = path.join(__dirname, "familias.json");

// Funções auxiliares
function carregarFamilias() {
  try {
    const data = fs.readFileSync(FAMILIAS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao carregar familias.json:", err);
    return [];
  }
}

function salvarFamilias(familias) {
  try {
    fs.writeFileSync(FAMILIAS_FILE, JSON.stringify(familias, null, 2), "utf8");
  } catch (err) {
    console.error("Erro ao salvar familias.json:", err);
  }
}

// Rota para buscar uma família pelo código
app.get("/familia/:codigo", (req, res) => {
  try {
    const codigo = req.params.codigo;
    const familias = carregarFamilias();
    const familia = familias.find(f => f.codigo === codigo);

    if (!familia) {
      return res.status(404).json({ erro: "Família não encontrada." });
    }

    return res.json({
      codigo: familia.codigo,
      nome: familia.nome || "Sem nome",
      convidados: Array.isArray(familia.convidados) ? familia.convidados : []
    });

  } catch (err) {
    console.error("Erro na rota /familia/:codigo:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Rota para confirmar presença
app.post("/confirmar/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo;
    const familias = carregarFamilias();
    const familia = familias.find(f => f.codigo === codigo);

    if (!familia) {
      return res.status(404).json({ erro: "Família não encontrada." });
    }

    // Atualiza a lista de convidados no JSON
    familia.convidados = req.body.convidados;
    salvarFamilias(familias);

    // Também envia para a planilha (Google Sheets)
    await adicionarPresenca(familia.codigo, familia.nome, familia.convidados);

    return res.json({ mensagem: "Presença confirmada com sucesso!" });

  } catch (err) {
    console.error("Erro na rota /confirmar/:codigo:", err);
    return res.status(500).json({ erro: "Erro ao salvar presença." });
  }
});

// 🔑 Mercado Pago SDK v2
const mpClient = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const preference = new mercadopago.Preference(mpClient);

// 🚀 Rota para criar preferência de pagamento
app.post("/criar-pagamento", async (req, res) => {
  try {
    const { nome, preco, imagem } = req.body;

    const body = {
      items: [
        {
          title: nome,
          unit_price: Number(preco),
          quantity: 1,
          picture_url: imagem
        }
      ],
      back_urls: {
        success: "https://casamentodavierafa.onrender.com/presentes.html",
        failure: "https://casamentodavierafa.onrender.com/presentes.html",
        pending: "https://casamentodavierafa.onrender.com/presentes.html"
      },
      auto_return: "approved"
    };

    const response = await preference.create({ body });

    res.json({ url: response.init_point });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

// Tratamento para rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
