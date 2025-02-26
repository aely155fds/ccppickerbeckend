require('dotenv').config(); // Carrega variáveis do .env
const express = require('express');
const cors = require('cors');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log(connectionString)
const sql = postgres(connectionString);

async function testConnection() {
    try {
        await sql`SELECT 1`;
        console.log("Conexão bem-sucedida!");
    } catch (error) {
        console.error("Erro na conexão:", error);
    }
}

testConnection();

const app = express();
const PORT = process.env.PORT || 3300;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota GET para buscar todos os cartões
app.get('/ok', async (req, res) => {
    res.json({
        ok: "yes"
    })
});

// Rota GET para buscar todos os cartões
app.get('/cards', async (req, res) => {
    try {
        const cards = await sql`SELECT * FROM cards`;
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cartões', details: error.message });
    }
});

// Rota POST para adicionar um novo cartão
app.post('/cards', async (req, res) => {
    const { name, mail, cpf, cardNumber, cvv, expireDate } = req.body;
    try {
        const newCard = await sql`
            INSERT INTO cards (name, mail, cpf, cardNumber, cvv, expireDate)
            VALUES (${name}, ${mail}, ${cpf}, ${cardNumber}, ${cvv}, ${expireDate})
            RETURNING *;
        `;

        res.status(201).json(newCard[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar cartão', details: error });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
