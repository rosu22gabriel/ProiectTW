const http = require('http');
const assert = require('assert');

const HOST = 'localhost';
const PORT = Number(process.env.PORT || 8080);

function requestJson(method, path, body) {
    const data = body ? JSON.stringify(body) : null;

    const options = {
        hostname: HOST,
        port: PORT,
        path,
        method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data ? Buffer.byteLength(data) : 0,
        },
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let raw = '';
            res.on('data', chunk => {
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

async function expectBadRequest(method, path, body) {
    const response = await requestJson(method, path, body);
    assert.strictEqual(response.statusCode, 400);
    assert.ok(response.body && response.body.message);
}

async function expectUnauthorized(method, path, body) {
    const response = await requestJson(method, path, body);
    assert.strictEqual(response.statusCode, 401);
}

async function run() {
    try {
        await expectUnauthorized('POST', '/api/users', { username: 'test' });
        await expectUnauthorized('PUT', '/api/users/1', {});

        await expectUnauthorized('POST', '/api/notes', { title: 'Test' });
        await expectUnauthorized('PUT', '/api/notes/1', {});

        await expectUnauthorized('POST', '/api/groups', { name: 'Test' });
        await expectUnauthorized('PUT', '/api/groups/1', {});

        await expectUnauthorized('POST', '/api/subjects', { name: 'Test' });
        await expectUnauthorized('PUT', '/api/subjects/1', {});

        await expectUnauthorized('POST', '/api/tags', {});
        await expectUnauthorized('PUT', '/api/tags/1', {});

        await expectUnauthorized('POST', '/api/attachments', { filename: 'a.txt' });
        await expectUnauthorized('PUT', '/api/attachments/1', {});

        console.log('Route auth tests passed.');
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error(`Server not running on http://${HOST}:${PORT}. Start it with: node server.js`);
            process.exitCode = 1;
            return;
        }
        console.error('Route validation tests failed:', error.message);
        process.exitCode = 1;
    }
}

run();
