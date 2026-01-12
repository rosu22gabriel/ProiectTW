const Sequelize = require ('sequelize');

// database - instanta Sequelize, conexiunea cu o baza de date
// parametrii: numele bazei de date, user, parola, optiuni conexiune
const database = new Sequelize('bd-proiect-tw', 'root', '', { 
    dialect: 'mysql',
    host: "localhost",
    define: {
        charset: "utf8",
        collate: "utf8_general_ci",
        timestamp: true,
    }
});


// Verifica daca conexiunea cu baza de date a fost stabilita
async function authenticateDatabase(){ 
    try { 
        await database.authenticate();
        console.log('Connection has been established'); 
    } catch (error) {
        console.log('Unable to connect to the database:', error);
    }
}


module.exports = {
    database,
    authenticateDatabase,
}