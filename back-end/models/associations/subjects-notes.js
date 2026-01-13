const { noteModel } = require('../notes-model');
const { subjectModel } = require('../subjects-model');

// Relatie de asociere One-To-Many intre subjects si notes
// O materie poate avea mai multe notite

subjectModel.hasMany(noteModel, { 
    foreignKey: 'subjectId'
});

noteModel.belongsTo(subjectModel, {
    foreignKey: 'subjectId'
});


