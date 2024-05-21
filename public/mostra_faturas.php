<?php

// Configure sua conexão com o Azure Cosmos DB aqui

// Configurações do Azure Cosmos DB
$endpoint = 'SEU_ENDPOINT_DO_COSMOS_DB';
$key = 'SUA_CHAVE_PRIMÁRIA_DO_COSMOS_DB';
$databaseId = 'NOME_DO_BANCO_DE_DADOS';
$containerId = 'NOME_DO_CONTAINER';

// Crie a conexão ao Azure Cosmos DB
$client = new CosmosClient($endpoint, $key);
$container = $client->getContainer($databaseId, $containerId);

// Consulta para recuperar todas as despesas
$query = "SELECT * FROM c";

// Execute a consulta
$expenses = $container->queryItems($query);

// Exiba os resultados
foreach ($expenses as $expense) {
    echo 'Descrição: ' . $expense['description'] . ', Valor: €  ' . number_format($expense['amount'], 2) . '<br>';
}
?>
