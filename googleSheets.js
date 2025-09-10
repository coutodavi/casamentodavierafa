const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'ascendant-hub-471615-p3-f0e50336a98a.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetId = '14QkGkCx3oaRN73imHCV2ScAjrY7kjrApPU37elCMd2o'; // <<< cole aqui

async function adicionarPresenca(codigo, familia, convidados) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const hoje = new Date().toISOString().split('T')[0];

  // 1. Lê todas as linhas atuais da planilha
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A:E',
  });

  const rows = response.data.values || [];

  // 2. Cria um array com as atualizações
  const novasLinhas = [];
  for (const convidado of convidados) {
    const linhaExistenteIndex = rows.findIndex(row =>
      row[0] === codigo && row[2] === convidado.nome
    );

    const novaLinha = [codigo, familia, convidado.nome, convidado.presenca, hoje];

    if (linhaExistenteIndex !== -1) {
      // 3. Atualiza a linha existente
      const range = `A${linhaExistenteIndex + 1}:E${linhaExistenteIndex + 1}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [novaLinha] },
      });
    } else {
      // 4. Adiciona uma nova linha
      novasLinhas.push(novaLinha);
    }
  }

  // 5. Se houver novas linhas, faz o append
  if (novasLinhas.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: novasLinhas,
      },
    });
  }

  console.log('Presenças atualizadas com sucesso.');
}

module.exports = { adicionarPresenca };
