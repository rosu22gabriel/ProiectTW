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
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mimeType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data: {
            type: DataTypes.BLOB('long'),
            allowNull: false,
        },
});

module.exports = { attachmentsModel };
