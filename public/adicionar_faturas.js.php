<?php

use MongoDB\Client as MongoClient;

// Verifica se os dados do formulário foram submetidos
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Verifica se os campos obrigatórios estão preenchidos
    if (isset($_POST['description']) && isset($_POST['amount'])) {
        // Valida os dados do formulário
        $description = htmlspecialchars($_POST['description']);
        $amount = floatval($_POST['amount']);

        // Verifica se os dados são válidos
        if (!empty($description) && $amount > 0) {
            // Configure sua conexão com o Azure Cosmos DB aqui

            // Configurações do Azure Cosmos DB
            $endpoint = 'https://basededados.documents.azure.com:443/';
            $key = 'wOSdtRyKgTAkehAbmDmgZGjlYnTChEbmMdx5q4bH1RY1IbXxDjp7WWXJqsnbK3JPcKUZZQJ2sdFzACDbk1cKBw==';
            $databaseId = 'aplicacao';
            $containerId = 'faturas';

            // Crie a conexão ao Azure Cosmos DB usando o SDK do MongoDB para PHP
            $connectionString = "mongodb://${endpoint}:${key}@${endpoint}:${key}/${databaseId}?ssl=true";

            // Crie uma instância do cliente MongoDB
            $mongoClient = new MongoClient($connectionString);

            // Selecione o banco de dados
            $database = $mongoClient->selectDatabase($databaseId);

            // Selecione o contêiner (coleção)
            $collection = $database->selectCollection($containerId);

            // Crie um novo documento para inserir no banco de dados
            $item = [
                'description' => $description,
                'amount' => $amount
            ];

            // Insira o documento no banco de dados
            $result = $collection->insertOne($item);

            // Verifique se a inserção foi bem-sucedida
            if ($result->getInsertedCount() == 1) {
                // Redirecione de volta para a página principal com uma mensagem de sucesso
                header('Location: index.php?success=true');
                exit();
            } else {
                // Redirecione de volta para a página principal com uma mensagem de erro
                header('Location: index.php?error=true');
                exit();
            }
        } else {
            // Redireciona de volta para a página principal com uma mensagem de erro se os dados do formulário forem inválidos
            header('Location: index.php?error=true');
            exit();
        }
    } else {
        // Redireciona de volta para a página principal com uma mensagem de erro se os campos obrigatórios não estiverem preenchidos
        header('Location: index.php?error=true');
        exit();
    }
} else {
    // Se os dados não foram submetidos via POST, redireciona para a página principal
    header('Location: index.php');
    exit();
}

?>
