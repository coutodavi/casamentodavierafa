let todosPresentes = [];

async function carregarPresentes() {
  const container = document.getElementById("lista-presentes");

  try {
    const response = await fetch("presentes.json");
    todosPresentes = await response.json();
    exibirPresentes("Todos");
  } catch (err) {
    console.error("Erro ao carregar presentes:", err);
    container.innerHTML = "<p>Erro ao carregar a lista de presentes.</p>";
  }
}

function exibirPresentes(categoria) {
  const container = document.getElementById("lista-presentes");
  container.innerHTML = "";

  const presentesFiltrados = categoria === "Todos"
    ? todosPresentes
    : todosPresentes.filter(p => p.categoria === categoria);

  if (presentesFiltrados.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>Nenhum presente nesta categoria.</p>";
    return;
  }

  presentesFiltrados.forEach(p => {
    const item = document.createElement("div");
    item.className = "presente";
    item.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}" />
      <div class="presente-conteudo">
        <div>
          <h3>${p.nome}</h3>
          <p>${p.valor}</p>
        </div>
        <a href="${p.link}" target="_blank">Presentear</a>
      </div>
    `;
    container.appendChild(item);
  });
}

function filtrarPresentes(categoria) {
  exibirPresentes(categoria);
}

carregarPresentes();
