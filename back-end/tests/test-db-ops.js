// Acest fisier contine testele pentru modelele definite in aplicatie
// si asocierile dintre acestea

const { database, authenticateDatabase } = require('../db/db-config');
const { 
    resetDatabase, 
    createElement, 
    getAllElements, 
    getElementById, 
    updateElement, 
    deleteElement 
} = require('../db/db-utils');


// Importarea modelelelor

const userModel = require('../models/users-model');
const noteModel = require('../models/notes-model');
const groupModel = require('../models/groups-model');
const subjectModel = require('../models/subjects-model');
const tagModel = require('../models/tags-model');
const attachmentsModel = require('../models/attachments-model');


// Importarea asocierilor dintre modele

require('../models/associations/users-notes');
require('../models/associations/notes-tags');
require('../models/associations/notes-attachments');
require('../models/associations/subjects-notes');
require('../models/associations/users-groups');

async function testDatabaseOperations() {
    try {

        // Autentificarea bazei de date
        authenticateDatabase();
        console.log('Connection has been established successfully.');

        // Resetarea bazei de date inainte de teste
        await resetDatabase(database);
        console.log('Database reset successfully');


        // Testarea crearii unor utilizatori
        let user1 = await createElement(userModel, { username: 'testuser1', email: 'testuser1@stud.ase.ro', passwordHash: 'hash1' });
        let user2 = await createElement(userModel, { username: 'testuser2', email: 'testuser2@stud.ase.ro', passwordHash: 'hash2' });
        console.log('Users created:', user1.username, user2.username);


        // Testarea obtinerii tuturor utilizatorilor
        const allUsers = await getAllElements(userModel);
        console.log('All users:', allUsers.map(u => u.username));


        // Testarea obtinerii unui utilizator dupa ID
        const foundUser1 = await getElementById(userModel, user1.userId);
        console.log('Found user1 by ID:', foundUser1.username);


        // Testarea actualizarii unui utilizator
        const updatedUser1 = await updateElement(userModel, user1.userId, { passwordHash: 'newhash1' });
        if (updatedUser1 && updatedUser1.passwordHash === 'newhash1') {
            console.log('Updated user1 password', updatedUser1.passwordHash);
        } else {
            throw new Error('User1 update failed');
        }

        // Testarea stergerii unui utilizator
        const deleteResult = await deleteElement(userModel, user2.userId);
        if (deleteResult) {
            console.log('Deleted user2 successfully');
        } else {
            throw new Error('User2 deletion failed');
        }

    } catch (error) {
        console.log('Error during models and associations test:', error);
    }
}

async function testAssociations() {
    try {
        // User
        testUser = await createElement(userModel, { username: 'testUser', email: 'testuser@stud.ase.ro', passwordHash: 'testHash' });
        
        const testGroup = await createElement(groupModel, {
            name: 'Test Group',
            ownerId: testUser.userId,
        }); 


        // Grupuri

        const ownedGroups = await testUser.getOwnedGroups();
        console.log('Owned groups for testUser:', ownedGroups.map(g => g.name));

        const testUser2 = await createElement(userModel, {
            username: 'testUser2',
            email: 'testuser2@stud.ase.ro',
            passwordHash: 'testHash2',
        }); 

        await groupModel.addMember(testUser2);
        await groupModel.addMember(testUser);

        const groupMembers = await testGroup.getMembers();

        console.log('Members of test group:', groupMembers.map(u => u.username));
        

        // Notite, Etichete, Materii, Atasamente
        const tag1 = await createElement(tagModel, { name: 'Important' });
        const note = await createElement(noteModel, { title: 'Test Note', content: 'This is a test note.', userId: testUser.userId });
        await note.addTag(tag1);
        const noteTags = await note.getTags();
        console.log('Tags for test note:', noteTags.map(t => t.name));


        const subject1 = await createElement(subjectModel, { name: 'Tehnologii Web' });
        await subject1.addNote(note);
        const subjectNotes = await subject1.getNotes();
        console.log('Notes for subject Tehnologii Web:', subjectNotes.map(n => n.title));


        const attachment1 = await createElement(attachmentsModel, { filename: 'file1.pdf', filepath: '/files/file1.pdf' });
        await note.addAttachment(attachment1);
        const noteAttachments = await note.getAttachments();
        console.log('Attachments for test note:', noteAttachments.map(a => a.filename));

        
        console.log('Everything went to plan');
    
    } catch (error) {
        console.log('Error during associations test: ', error);
    }
}

testDatabaseOperations()
    .then(() => testAssociations())
    .catch(error => console.log('Error in running tests', error));
