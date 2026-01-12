const { DataTypes } = require('sequelize');
const { database } = require('../db/db-config');

// todo: Pentru content poate fi schimbat tipul atributului din BLOB

const noteModel = database.define(
    'notes', {
        noteId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        title: { 
            type: DataTypes.STRING(15),
            allowNull: false,
        }, 
        content: { 
            type: DataTypes.BLOB,
            allowNull: false,
        },
});

module.exports = { noteModel };

