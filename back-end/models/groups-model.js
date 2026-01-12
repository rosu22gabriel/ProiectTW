const { database } = require('../db/db-config');
const { DataTypes } = require('sequelize');

const groupModel = database.define(
    'groups', {
        groupId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }  
});

module.exports = { groupModel };