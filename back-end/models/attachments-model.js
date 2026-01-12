const { database } = require('../db/db-config');
const { DataTypes } = require('sequelize');


const attachmentsModel = database.define(
    'attachments', {
        attachmentId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        }, 
        filePath: { 
            type: DataTypes.STRING,
            allowNull: false,
        }
});

module.exports = { attachmentsModel };