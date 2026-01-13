const { noteModel } = require('../notes-model');
const { tagModel } = require('../tags-model');


// Relatie Many-To-Many intre notes si tags prin tabela de jonctiune 'noteTags'
// O notita poate avea mai multe etichete (tags)
// si o eticheta poate fi asociata cu mai multe notite

noteModel.belongsToMany(tagModel, {
    through: 'noteTags', // Numele tabelei de jonctiune
    foreignKey: 'noteId',
    otherKey: 'tagId',
    as: 'tags',
})

tagModel.belongsToMany(noteModel, {
    through: 'noteTags', // Numele tabelei de jonctiune
    foreignKey: 'tagId',
    otherKey: 'noteId',
    as: 'notes',
});
