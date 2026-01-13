const { DataTypes } = require('sequelize');
const { database } = require('../db/db-config');

// Content este stocat ca TEXT pentru markdown si cautare usoara

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
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
});

module.exports = { noteModel };

