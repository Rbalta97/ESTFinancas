const express = require('express');
const bodyParser = require('body-parser');
const { CosmosClient } = require('@azure/cosmos');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para analisar o corpo da solicitação
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar arquivos estáticos (se você tiver uma pasta public)
app.use(express.static(path.join(__dirname, 'public')));

// Configurar multer para processar uploads de arquivo
const upload = multer({ dest: 'uploads/' });

// Configurações do Azure Cosmos DB
const endpoint = 'https://cosmos-trabpratico.documents.azure.com:443/';
const key = ';tZiCaD8eR0Qumu0KJ1RIJpUPsRIzhbY9lOOv5bmvlHkc4fYeuwwtRmlkUuAkFP6nzxzelpCiVgqLACDbTEKtZA==;';
const databaseId = 'registo_faturas';
const containerId = 'faturas';

// Criar uma instância do CosmosClient
const client = new CosmosClient({ endpoint, key });

// Inicializar o banco de dados e o contêiner
let container;

async function initialize() {
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container: cont } = await database.containers.createIfNotExists({ id: containerId });
    container = cont;
    console.log('Conectado ao Azure Cosmos DB');
}

initialize().catch(error => console.error(error));

// Rota para registrar uma fatura
app.post('/adicionar_faturas', async (req, res) => {
    const { description, amount } = req.body;

    if (description && amount > 0) {
        const item = { description, amount };

        try {
            const { resource: createdItem } = await container.items.create(item);
            res.status(201).json({ success: true, message: 'Fatura registrada com sucesso', item: createdItem });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Erro ao registrar a fatura' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Dados inválidos' });
    }
});

// Rota para obter todas as faturas
app.get('/faturas', async (req, res) => {
    try {
        const { resources: items } = await container.items.readAll().fetchAll();
        res.status(200).json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao obter as faturas' });
    }
});

// Rota para deletar uma fatura
app.delete('/deleteExpense/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await container.item(id, id).delete();
        res.status(200).json({ success: true, message: 'Fatura excluída com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao excluir a fatura' });
    }
});

// Rota para lidar com o upload de arquivo PDF
app.post('/upload', upload.single('pdfFile'), async (req, res) => {
    const pdfPath = req.file.path;

    fs.readFile(pdfPath, async (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao ler o arquivo PDF' });
        }

        const attachments = data.toString('base64');

        try {
            const { resource: createdItem } = await container.items.create({ attachments });
            res.status(201).json({ success: true, message: 'PDF enviado com sucesso', item: createdItem });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Erro ao enviar o PDF' });
        }
    });
});

// Rota para visualizar um PDF
app.get('/viewPDF/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { resource: item } = await container.item(id, id).read();
        const attachments = item.attachments;

        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(attachments, 'base64'));
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao visualizar o PDF' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
