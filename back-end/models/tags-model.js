const { database } = require('../db/db-config');
const { DataTypes } = require('sequelize');

const tagModel = database.define(
    'tags',
    {
        tagId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        content: { 
            type: DataTypes.TEXT,
            allowNull: false,
        },
});

module.exports = { tagModel };