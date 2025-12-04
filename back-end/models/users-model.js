const { DataTypes } = require('sequelize');
const database = require('./db-config');

// todo: Poate fi inclus atributul 'role' mai tarziu
const userModel = sequelize.define(
    'user', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        username: { 
            type: DataTypes.STRING(15),
            allowNull: false,
        }, 
        passwordHash: { 
            type: DataType.STRING(255),
            allowNull: false,
        },
    }
)

