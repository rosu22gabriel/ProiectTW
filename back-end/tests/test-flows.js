const http = require('http');
const assert = require('assert');

const HOST = 'localhost';
const PORT = Number(process.env.PORT || 8080);

function requestJson(method, path, body, token) {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const options = { hostname: HOST, port: PORT, path, method, headers };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => {
                raw += chunk.toString('utf8');
            });
            res.on('end', () => {
                let parsed = null;
                if (raw) {
                    try {
                        parsed = JSON.parse(raw);
                    } catch (error) {
                        return reject(error);
                    }
                }
                resolve({ statusCode: res.statusCode, body: parsed });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    try {
        const reset = await requestJson('POST', '/resetDatabase');
        console.log('resetDatabase', reset.statusCode, reset.body);

        const suffix = Date.now() % 10000;
        const user1 = await requestJson('POST', '/api/auth/register', {
            username: `u1_${suffix}`,
            email: `user1_${suffix}@stud.ase.ro`,
            password: 'pass1234',
        });
        console.log('register user1', user1.statusCode, user1.body);
        const user2 = await requestJson('POST', '/api/auth/register', {
            username: `u2_${suffix}`,
            email: `user2_${suffix}@stud.ase.ro`,
            password: 'pass1234',
        });
        console.log('register user2', user2.statusCode, user2.body);
        assert.strictEqual(user1.statusCode, 201);
        assert.strictEqual(user2.statusCode, 201);

        const login1 = await requestJson('POST', '/api/auth/login', {
            email: `user1_${suffix}@stud.ase.ro`,
            password: 'pass1234',
        });
        console.log('login user1', login1.statusCode, login1.body);
        const login2 = await requestJson('POST', '/api/auth/login', {
            email: `user2_${suffix}@stud.ase.ro`,
            password: 'pass1234',
        });
        console.log('login user2', login2.statusCode, login2.body);
        assert.strictEqual(login1.statusCode, 200);
        assert.strictEqual(login2.statusCode, 200);

        const token1 = login1.body.token;
        const token2 = login2.body.token;

        const group = await requestJson('POST', '/api/groups', { name: 'Test Group' }, token1);
        console.log('create group', group.statusCode, group.body);
        assert.strictEqual(group.statusCode, 201);

        const invite = await requestJson(
            'POST',
            `/api/groups/${group.body.groupId}/invite`,
            { email: `user2_${suffix}@stud.ase.ro` },
            token1,
        );
        console.log('invite member', invite.statusCode, invite.body);
        assert.strictEqual(invite.statusCode, 201);

        const invites = await requestJson('GET', '/api/groups/invites', null, token2);
        console.log('get invites', invites.statusCode, invites.body);
        assert.strictEqual(invites.statusCode, 200);
        assert.ok(invites.body.length >= 1);

        const inviteId = invites.body[0].inviteId;
        const accept = await requestJson('POST', `/api/groups/invites/${inviteId}/accept`, null, token2);
        console.log('accept invite', accept.statusCode, accept.body);
        assert.strictEqual(accept.statusCode, 200);

        const members = await requestJson('GET', `/api/groups/${group.body.groupId}/members`, null, token1);
        console.log('group members', members.statusCode, members.body);
        assert.strictEqual(members.statusCode, 200);

        const note = await requestJson(
            'POST',
            '/api/notes',
            { title: 'Test Note', content: 'Test content' },
            token1,
        );
        console.log('create note', note.statusCode, note.body);
        assert.strictEqual(note.statusCode, 201);

        const share = await requestJson(
            'POST',
            `/api/notes/${note.body.noteId}/share`,
            { email: `user2_${suffix}@stud.ase.ro` },
            token1,
        );
        console.log('share note', share.statusCode, share.body);
        assert.strictEqual(share.statusCode, 201);

        const sharedNotes = await requestJson('GET', '/api/notes/shared', null, token2);
        console.log('shared notes', sharedNotes.statusCode, sharedNotes.body);
        assert.strictEqual(sharedNotes.statusCode, 200);
        assert.ok(sharedNotes.body.length >= 1);

        const sharedByMe = await requestJson('GET', '/api/notes/shared-by-me', null, token1);
        console.log('shared by me', sharedByMe.statusCode, sharedByMe.body);
        assert.strictEqual(sharedByMe.statusCode, 200);
        assert.ok(sharedByMe.body.length >= 1);

        const revoke = await requestJson(
            'DELETE',
            `/api/notes/${note.body.noteId}/share/${user2.body.userId}`,
            null,
            token1,
        );
        console.log('revoke share', revoke.statusCode, revoke.body);
        assert.strictEqual(revoke.statusCode, 204);

        const wiki = await requestJson('GET', '/api/external/wikipedia?title=Node.js');
        console.log('wiki', wiki.statusCode, wiki.body);
        assert.strictEqual(wiki.statusCode, 200);
        assert.ok(wiki.body && wiki.body.title);

        console.log('Flow tests passed.');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error(`Server not running on http://${HOST}:${PORT}. Start it with: node server.js`);
            process.exitCode = 1;
            return;
        }
        console.error('Flow tests failed:', error.message);
        process.exitCode = 1;
    }
}

run();
