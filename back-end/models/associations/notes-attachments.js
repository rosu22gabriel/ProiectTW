const { noteModel } = require('../notes-model');
const { attachmentsModel } = require('../attachments-model');

// Relatie de asociere One-To-Many intre notes si attachments
// O notita poate avea mai multe atasamente (attachments)

noteModel.hasMany(attachmentsModel, {
    foreignKey: {
        name: 'noteId', 
    } 
});

attachmentsModel.belongsTo(noteModel, {
    foreignKey: {
        name: 'noteId',
        allowNull: false, 
    }
})
