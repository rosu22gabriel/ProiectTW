const { userModel } = require('../users-model');
const { groupModel } = require('../groups-model');
const { groupInviteModel } = require('../group-invites-model');

// Relatie One-To-Many intre users si groups pentru proprietarul grupului
// Un user poate detine mai multe grupuri
// Un grup are un singur proprietar

userModel.hasMany(groupModel, {
    foreignKey: 'ownerId',
    as: 'ownedGroups',
});

groupModel.belongsTo(userModel, {
    foreignKey: 'ownerId',
    as: 'owner',
});


// Relatie Many-To-Many intre users si groups prin tabela de jonctiune 'groupMembers'
// Un user poate fi membru in mai multe grupuri
// si un grup poate avea mai multi membri

userModel.belongsToMany(groupModel, {
    through: 'groupMembers', // Numele tabelei de jonctiune
    foreignKey: 'userId',
    otherKey: 'groupId',
    as: 'groups',
});

groupModel.belongsToMany(userModel, {
    through: 'groupMembers', // Numele tabelei de jonctiune
    foreignKey: 'groupId',
    otherKey: 'userId',
    as: 'members',
});

// Invitatii de grup
groupModel.hasMany(groupInviteModel, {
    foreignKey: 'groupId',
    as: 'invites',
});

groupInviteModel.belongsTo(groupModel, {
    foreignKey: 'groupId',
    as: 'group',
});

userModel.hasMany(groupInviteModel, {
    foreignKey: 'invitedUserId',
    as: 'groupInvites',
});

groupInviteModel.belongsTo(userModel, {
    foreignKey: 'invitedUserId',
    as: 'invitedUser',
});

userModel.hasMany(groupInviteModel, {
    foreignKey: 'invitedByUserId',
    as: 'sentGroupInvites',
});

groupInviteModel.belongsTo(userModel, {
    foreignKey: 'invitedByUserId',
    as: 'invitedBy',
});



