<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (isset($_FILES['comprovante_deposito']) && $_FILES['comprovante_deposito']['error'] == 0) {

        $arquivo_tmp = $_FILES['comprovante_deposito']['tmp_name'];
        $nome_arquivo = basename($_FILES['comprovante_deposito']['name']);
        $tipo_arquivo = $_FILES['comprovante_deposito']['type'];

        // URL do Google Apps Script
        $script_do_google = 'https://script.google.com/...';

        // Funções para filtrar os campos
        function filtrarNome($nome)
        {
            return preg_replace('/[^a-zA-Zà-úÀ-Ú\s\,.\']/', '', $nome);
        }

        $nome_filtrado = filtrarNome($_POST['nome_completo']);
        $tipo_solicitacao = $_POST['tipo_solicitacao'];
        $data_solicitacao = $_POST['data_solicitacao'];

        // Coleta os dados do formulário e o arquivo
        $dados_do_formulario = [
            'nome_completo' => $nome_filtrado,  
            'nome_arquivo' => $nome_arquivo,
            'tipo_arquivo' => $tipo_arquivo,
            'arquivo' => base64_encode(file_get_contents($arquivo_tmp)),
           
        ];

        // Debug para verificar os dados do POST
        echo '<pre>';
        var_dump($dados_do_formulario);
        echo '</pre>';

        // Configuração do cURL
        $ch = curl_init($script_do_google);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($dados_do_formulario));
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

        // Executa o cURL
        $response = curl_exec($ch);

        // Verifica se houve erro
        if ($response === false) {
            echo 'Erro no envio dos dados: ' . curl_error($ch);
        } else {
            echo 'Dados enviados com sucesso! Resposta do servidor: ' . $response;
        }

        // Fecha a conexão cURL
        curl_close($ch);
    } else {
        echo 'Erro no upload do arquivo.';
    }
}
