const { database } = require('../db/db-config');
const { DataTypes } = require('sequelize');

const subjectModel = database.define(
    'subjects', {
        subjectId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        
});


module.exports = { subjectModel };
