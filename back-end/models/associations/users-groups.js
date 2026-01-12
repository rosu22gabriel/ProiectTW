const userModel = require('../users-model');
const groupModel = require('../groups-model');

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



