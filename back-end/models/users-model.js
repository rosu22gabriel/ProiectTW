const { DataTypes } = require('sequelize');
const { database } = require('../db/db-config');

const userModel = database.define('users', {
    userId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('owner', 'editor', 'reader'),
        allowNull: true,
    },
});

module.exports = { userModel };
