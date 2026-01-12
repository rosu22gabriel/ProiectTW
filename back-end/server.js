const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const { database, authenticateDatabase } = require('./db/db-config');
const { resetDatabase } = require('./db/db-utils');

const authRoutes = require('./routes/auth-routes');
const usersRoutes = require('./routes/users-routes');
const notesRoutes = require('./routes/notes-routes');
const groupsRoutes = require('./routes/groups-routes');
const subjectsRoutes = require('./routes/subjects-routes');
const tagsRoutes = require('./routes/tags-routes');
const attachmentsRoutes = require('./routes/attachments-routes');

app.post('/resetDatabase', async (req, res) => {
    await resetDatabase(database);
    res.status(204).send();
});

authenticateDatabase();

// Middleware pentru parsarea JSON-ului
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/attachments', attachmentsRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
