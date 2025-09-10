const express = require("express");
const fs = require("fs");
const path = require("path");
const { adicionarPresenca } = require("./googleSheets");

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

// Tratamento para rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
