const { DataTypes } = require('sequelize');
const database = require('./db-config');

// todo: Pentru content poate fi schimbat tipul atributului din BLOB
const notesModel = sequelize.define(
    'notes', {
        id: {
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
    }
)