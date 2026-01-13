const { DataTypes } = require('sequelize');
const { database } = require('../db/db-config');

const groupInviteModel = database.define('groupInvites', {
    inviteId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    invitedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    invitedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending',
    },
});

module.exports = { groupInviteModel };
