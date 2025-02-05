const sheetName = "NOME DA PLANILHA"; // Nome da planilha
const scriptProp = PropertiesService.getScriptProperties(); // Propriedades do script

// Função para configuração inicial
function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet(); // Planilha ativa
  scriptProp.setProperty('key', activeSpreadsheet.getId()); // Armazena o ID da planilha no script
}

function doPost(e) {
  const lock = LockService.getScriptLock(); // Obter um bloqueio
  try {
    lock.tryLock(1000); // Tentar adquirir o bloqueio por 1 segundo

    // Obter os dados do formulário
    const dados = e.parameter;

    // Acessar a planilha ativa e a aba com nome "Dados"
    const activeSpreadsheet = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = activeSpreadsheet.getSheetByName(sheetName);

    // Adicionar os dados na planilha
    const rowData = [
      dados.nome_completo,
      dados.comprovante_deposito, // Inicialmente, este campo pode estar vazio
    ];

    // Adicionar a linha na planilha
    sheet.appendRow(rowData);

    // Processar e salvar a imagem no Google Drive
    if (dados.arquivo && dados.nome_arquivo && dados.tipo_arquivo) {
      var arquivoBytes = Utilities.base64Decode(dados.arquivo);
      var blob = Utilities.newBlob(arquivoBytes, dados.tipo_arquivo, dados.nome_arquivo);

      var pasta = DriveApp.getFolderById('ID_PASTA'); // ID da pasta no Drive
      var arquivo = pasta.createFile(blob); // Cria o arquivo no Drive

      // Tornar o arquivo acessível publicamente
      arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      // Obter o link compartilhável do arquivo
      var linkCompartilhavel = arquivo.getUrl();

      // Atualizar o campo "comprovante_deposito" na planilha
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 13).setValue(linkCompartilhavel); // 13 é a coluna do comprovante_deposito
    }

    // Retornar uma resposta de sucesso
    return ContentService.createTextOutput('Dados e arquivo enviados com sucesso!')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    // Se ocorrer algum erro, retornar a mensagem de erro
    return ContentService.createTextOutput('Erro ao processar os dados: ' + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  } finally {
    // Liberar o bloqueio
    lock.releaseLock();
  }
}
