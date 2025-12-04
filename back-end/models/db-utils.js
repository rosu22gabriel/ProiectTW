const { database } = require("./db-config");

/**
 * Sterge toate tabelele din baza de date si le recreaza 
 * 
 * @param {Sequelize} database - instanta Sequelize / Conexiunea cu baza de date
 * @returns {Promise<void>} 
 * 
 */

async function resetDatabase(database) {
    try {
        await database.sync({ force: true });
        console.log("Database reset complete.");
    } catch (err) {
        console.log("Error resetting database:", err);
    }
}

/**
 * Creaza o noua inregistrare dupa un model Sequelize
 * 
 * @param {Model} model - Model Sequelize(tabela)
 * @param {Object} data - Date ale inregistrarii
 * @returns {Promise<Model>}
 */

async function createElement(model, data) {
    return await model.create(data);
}

/**
 * Intoarce toate inregistrarile de tipul unui model(tabela)
 * 
 * @param {Model} model - Model Sequelize(tabela)
 * @returns {Promise<Array<Model>>}
 */

async function getAllElements(model) {
    return await model.findAll();
}

/**
 * Intoarce o singura inregistrare dupa primary key
 * 
 * @param {Model} model - Model Sequelize(tabela)
 * @param {number} id - Valoarea primary key-ului dupa care se face interogarea
 * @returns {Promise<Model||null>} - Intoarce tabela modificata sau null daca nu este gasita
 */

async function getElementById(model, id) {
    return await model.findByPk(id);
}

/**
 * Actualizeaza/Modifica o inregistrare dupa primary key
 * 
 * @param {Model} model - Model Sequelize(tabela)
 * @param {number|string} id - Valoarea primary key-ului dupa care se face modificarea
 * @param {Object} newData - Modificarile aduse inregistrarii
 * @returns {Promise<Model|null} -Intoarce tabela modificata sau null daca nu este gasita
 */

async function updateElement(model, id, newData) {
    const element = await model.findByPk(id);
    if (!element) return null;
    return await element.update(newData);
}

/**
 * Sterge o inregistrare dupa primary key
 * 
 * @param {Model} model - Model Sequelize(tabela)
 * @param {number|string} id - Valoarea primary key-ului dupa care se face stergerea
 * @returns {Promise<boolean>} True daca s-a sters, false daca nu a fost gasita
 */


async function deleteElement(model, id) {
    const element = await model.findByPk(id);
    if (!element) return null;

    await element.destroy();
    return true;
}

module.exports = {
    resetDatabase,
    createElement,
    getAllElements,
    getElementById,
    updateElement,
    deleteElement,
}