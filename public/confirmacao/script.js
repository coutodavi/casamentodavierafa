let convidados = [];
let codigoAtual = "";
const dataLimite = new Date("2025-10-31"); // ajuste a data limite

function formatarDataLimite() {
  return dataLimite.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function atualizarBannerData() {
  const txt = document.getElementById("deadlineText");
  const status = document.getElementById("deadlineStatus");
  txt.textContent = formatarDataLimite();

  const hoje = new Date();
  const encerrado = hoje > dataLimite;
  status.textContent = encerrado ? "• período encerrado" : "• período aberto";
  status.classList.toggle("encerrado", encerrado);
  status.classList.toggle("aberto", !encerrado);

  if (encerrado) {
    document.getElementById("btnSalvar").disabled = true;
  }
}

function entrar() {
  codigoAtual = document.getElementById("codigo").value.trim();

  fetch("/familia/" + codigoAtual)
    .then(res => {
      if (!res.ok) {
        throw new Error("Erro HTTP " + res.status);
      }
      return res.json();
    })
    .then(data => {
      if (data.erro) {
        alert(data.erro);
        return;
      }

      // se chegou aqui, deu tudo certo
      convidados = data.convidados;
      document.getElementById("login").style.display = "none";
      document.getElementById("presenca").style.display = "block";

      renderizarLista();
      atualizarBannerData();
    })
    .catch(err => {
      console.error("Erro real ao buscar família:", err);

      // 👉 só mostra se realmente não conseguir conectar
      if (err.message.startsWith("Erro HTTP") || err.message.includes("Failed to fetch")) {
        alert("Servidor indisponível no momento. Tente novamente em alguns minutos.");
      } else {
        // apenas loga no console se não for um erro crítico
        console.warn("Ignorado: ", err.message);
      }
    });
}


function renderizarLista() {
  const lista = document.getElementById("listaConvidados");
  lista.innerHTML = "";

  convidados.forEach((c, i) => {
    const li = document.createElement("li");
    li.className = "convidado";

    const nome = document.createElement("div");
    nome.className = "nome";
    nome.innerText = c.nome;

    const botoes = document.createElement("div");
    botoes.className = "opcoes";

    const btnSim = document.createElement("button");
    btnSim.innerText = "✔ Irá comparecer";
    btnSim.className = "btn-sim";
    if (c.presenca === "Sim") btnSim.classList.add("ativo");

    btnSim.onclick = () => {
      c.presenca = "Sim";
      renderizarLista();
    };

    const btnNao = document.createElement("button");
    btnNao.innerText = "✖ Não irá comparecer";
    btnNao.className = "btn-nao";
    if (c.presenca === "Não") btnNao.classList.add("ativo");

    btnNao.onclick = () => {
      c.presenca = "Não";
      renderizarLista();
    };

    botoes.appendChild(btnSim);
    botoes.appendChild(btnNao);

    li.appendChild(nome);
    li.appendChild(botoes);
    lista.appendChild(li);
  });

  verificarSePodeSalvar();
}

function verificarSePodeSalvar() {
  const btnSalvar = document.getElementById("btnSalvar");
  const hoje = new Date();

  // Se já passou da data limite → bloqueia sempre
  if (hoje > dataLimite) {
    btnSalvar.disabled = true;
    return;
  }

  // Só habilita se todos tiverem escolhido
  const todosEscolhidos = convidados.every(c => c.presenca === "Sim" || c.presenca === "Não");
  btnSalvar.disabled = !todosEscolhidos;
}

function salvar() {
  const hoje = new Date();
  if (hoje > dataLimite) {
    alert("O prazo de confirmação acabou.");
    return;
  }

  const todosEscolhidos = convidados.every(c => c.presenca === "Sim" || c.presenca === "Não");
  if (!todosEscolhidos) {
    alert("Por favor, selecione uma opção para todos os convidados antes de salvar.");
    return;
  }

  // 👉 Mostra o loading
  document.getElementById("loading").style.display = "block";
  document.getElementById("mensagem").innerHTML = "";

  fetch("/confirmar/" + codigoAtual, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ convidados })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("mensagem").innerHTML = `
        <div class="agradecimento">
          💌 Obrigado por confirmar! Suas escolhas foram salvas com sucesso.
        </div>
      `;
    })
    .catch(err => {
      console.error("Erro ao salvar presença:", err);
      alert("Não foi possível salvar as presenças. Tente novamente.");
    })
    .finally(() => {
      // 👉 Esconde o loading sempre no fim
      document.getElementById("loading").style.display = "none";
    });
}
document.addEventListener("DOMContentLoaded", atualizarBannerData);
