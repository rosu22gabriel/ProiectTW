const Sequelize = require ('sequelize');

// database - instanta Sequelize, conexiunea cu o baza de date
// parametrii: numele bazei de date, user, parola, optiuni conexiune
const database = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS, 
    { 
        dialect: 'mysql',
        // host: process.env.DB_HOST,
        host: 'localhost',
        // port: process.env.DB_PORT,
        define: {
            charset: "utf8",
            collate: "utf8_general_ci",
            timestamp: true,
                }
    }
);


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