// Carrega o módulo express na memória
const express = require("express");
// Carrega o módulo dotenv para ler variáveis de ambiente
require("dotenv").config();
// Carrega o módulo mysql2 para conectar ao banco de dados MySQL
const mysql = require("mysql2/promise");

// Criar a instância do express
const app = express();

// Configurar a porta do servidor
const port = process.env.PORT || 7171;

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Adicionar o cors para permitir requisições de outros domínios
const cors = require("cors");
app.use(cors());

// Statements SQL para inserir um autor no banco
const sqlInsertAutor = "INSERT INTO autores (nome) VALUES (?)";

// Rota de API para cadastrar um autor com seu nome
app.post("/api/autores", async (req, res) => {
  const nome = req.body.nome;
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: "biblioteca",
    });
    await connection.execute(sqlInsertAutor, [nome]);
    connection.end();
    return res.status(201).json({ message: "Autor cadastrado com sucesso!" });
  } /*Em vez de derrubar o servidor, o servidor vai executar o catch*/ catch (error) {
    //Exibir o erro no console
    console.error("Erro ao conectar ao banco de dados:", error);
    //Retornar ao cliente a mensagem de erro
    return res
      .status(500)
      .json({ error: "Erro ao conectar ao banco de dados" });
  }
});

// Statement SQL que lista todos os livros cadastrados
const sqlListarLivros = `
SELECT titulo, ano_publicacao AS ano, nome AS autor
FROM livros, livros_autores, autores
WHERE
livros.livro_id = livros_autores.livro_id
AND livros_autores.autor_id = autores.autor_id`;
// Rota de API que lista todos os livros cadastrados
app.get("/api/livros", async (req, res) => {
  try {
    // Conectar com o banco de dados
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: "biblioteca",
    });
    // Executar o statement SQL
    const [rows] = await connection.execute(sqlListarLivros);
    connection.end();
    return res.status(200).json(rows);
  } catch (error) {
    // Exibir o erro no console
    console.error("Erro ao conectar ao banco de dados:", error);
    // Retornar ao cliente a mensagem de erro
    return res
      .status(500)
      .json({ error: "Erro ao conectar ao banco de dados" });
  }
});
// Colocar nossa instância para rodar
// O endereço IP é lido do arquivo .env
const ipAddress = process.env.IP_ADDRESS || "localhost";
app.listen(port, ipAddress, () => {
  console.log(`Servidor de API está rodando em http://${ipAddress}:${port}`);
});
