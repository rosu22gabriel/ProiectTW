const userModel = require('../users-model');
const noteModel = require('../notes-model');

// Relatie de asociere One-To-Many intre users si notes
// Un user poate avea mai multe notite

userModel.hasMany(noteModel, { 
    foreignKey: 'userId',
    as: 'authoredNotes',
});

noteModel.belongsTo(userModel, { 
    foreignKey: 'userId',
    as: 'author',
});


// Relatie Many-To-Many intre users si notes prin tabela de jonctiune 'sharedNote'
// Un user poate avea mai multe notite partajate 
// si o notita poate fi partajata cu mai multi useri

userModel.belongsToMany(noteModel, {
    through: 'sharedNote', // Numele tabelei de jonctiune
    foreignKey: 'userId',
    otherKey: 'noteId',
    as: 'sharedNotes',
});

noteModel.belongsToMany(userModel, {
    through: 'sharedNote', // Numele tabelei de jonctiune
    foreignKey: 'noteId',
});

