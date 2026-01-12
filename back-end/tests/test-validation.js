const assert = require('assert');
const {
    requireBodyFields,
    requireAtLeastOneField,
} = require('../middlewares/validation');

function createRes() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
}

function runMiddleware(middleware, req) {
    return new Promise(resolve => {
        const res = createRes();
        let nextCalled = false;
        const next = () => {
            nextCalled = true;
            resolve({ nextCalled, res });
        };

        middleware(req, res, next);

        if (!nextCalled) {
            resolve({ nextCalled, res });
        }
    });
}

async function testRequireBodyFields() {
    const middleware = requireBodyFields(['username', 'email', 'passwordHash']);

    const missingPassword = await runMiddleware(middleware, { body: { username: 'test', email: 'test@stud.ase.ro' } });
    assert.strictEqual(missingPassword.nextCalled, false);
    assert.strictEqual(missingPassword.res.statusCode, 400);
    assert.ok(missingPassword.res.body.message.includes('passwordHash'));

    const ok = await runMiddleware(middleware, { body: { username: 'test', email: 'test@stud.ase.ro', passwordHash: 'hash' } });
    assert.strictEqual(ok.nextCalled, true);
}

async function testRequireAtLeastOneField() {
    const middleware = requireAtLeastOneField(['title', 'content']);

    const emptyBody = await runMiddleware(middleware, { body: {} });
    assert.strictEqual(emptyBody.nextCalled, false);
    assert.strictEqual(emptyBody.res.statusCode, 400);

    const ok = await runMiddleware(middleware, { body: { content: 'text' } });
    assert.strictEqual(ok.nextCalled, true);
}

async function run() {
    try {
        await testRequireBodyFields();
        await testRequireAtLeastOneField();
        console.log('Validation middleware tests passed.');
    } catch (error) {
        console.error('Validation middleware tests failed:', error.message);
        process.exitCode = 1;
    }
}

run();
