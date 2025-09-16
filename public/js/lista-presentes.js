const lista = [
  {
    nome: "Conjunto de Toalhas Luxo",
    preco: 149.90,
    imagem: "img/produtos/toalhas.jpg",
    pagamento: "https://mpago.la/abc123"
  },
  {
    nome: "Aparelho de Jantar 16 peças",
    preco: 299.90,
    imagem: "img/produtos/jantar.jpg",
    pagamento: "https://mpago.la/def456"
  },
  {
    nome: "Liquidificador Inox",
    preco: 219.90,
    imagem: "img/produtos/liquidificador.jpg",
    pagamento: "https://mpago.la/ghi789"
  }
];

const container = document.getElementById("lista-presentes");

lista.forEach(presente => {
  const card = document.createElement("div");
  card.className = "presente";
  card.innerHTML = `
    <img src="${presente.imagem}" alt="${presente.nome}">
    <h3>${presente.nome}</h3>
    <p><strong>R$ ${presente.preco.toFixed(2).replace(".", ",")}</strong></p>
    <a href="${presente.pagamento}" target="_blank" class="botao">Presentear</a>
  `;
  container.appendChild(card);
});
