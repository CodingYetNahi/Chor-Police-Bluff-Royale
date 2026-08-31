import assert from 'node:assert/strict';
import { before, test } from 'node:test';

const project = process.env.GCLOUD_PROJECT || 'demo-chor-police';
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const documents = `http://${firestoreHost}/v1/projects/${project}/databases/(default)/documents`;
let member;
let outsider;

async function anonymous() {
  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  assert.equal(response.ok, true, 'Auth emulator must be running');
  return response.json();
}
function fields(value) {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === 'boolean'
        ? { booleanValue: item }
        : typeof item === 'number'
          ? { integerValue: String(item) }
          : { stringValue: item },
    ]),
  );
}
async function write(path, value, token = 'owner') {
  return fetch(`${documents}/${path}`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ fields: fields(value) }),
  });
}
async function read(path, token) {
  return fetch(`${documents}/${path}`, { headers: { authorization: `Bearer ${token}` } });
}

before(async () => {
  member = await anonymous();
  outsider = await anonymous();
  assert.equal((await write('rooms/RULE01', { status: 'LOBBY', hostUid: member.localId })).ok, true);
  assert.equal(
    (await write(`rooms/RULE01/members/${member.localId}`, { uid: member.localId, seatIndex: 0 })).ok,
    true,
  );
  assert.equal(
    (await write(`rooms/RULE01/privateState/${member.localId}`, { role: 'POLICE', score: 0 })).ok,
    true,
  );
});

test('non-member cannot read a room while a member can read public state', async () => {
  assert.equal((await read('rooms/RULE01', outsider.idToken)).status, 403);
  assert.equal((await read('rooms/RULE01', member.idToken)).status, 200);
});

test('a player cannot read another private state', async () => {
  assert.equal((await read(`rooms/RULE01/privateState/${member.localId}`, outsider.idToken)).status, 403);
  assert.equal((await read(`rooms/RULE01/privateState/${member.localId}`, member.idToken)).status, 200);
});

test('clients cannot alter rooms, roles, scores, votes, or entitlements', async () => {
  assert.equal((await write('rooms/RULE01', { status: 'FINISHED' }, member.idToken)).status, 403);
  assert.equal(
    (await write(`rooms/RULE01/privateState/${member.localId}`, { role: 'CHOR' }, member.idToken)).status,
    403,
  );
  assert.equal(
    (await write(`rooms/RULE01/votes/${member.localId}`, { targetSeatIndex: 1 }, member.idToken)).status,
    403,
  );
  assert.equal(
    (await write('entitlements/stolen', { userId: member.localId, status: 'ACTIVE' }, member.idToken)).status,
    403,
  );
});

test('non-admin cannot publish cases or read operational data', async () => {
  assert.equal((await write('cases/illegal', { title: 'Illegal edit' }, member.idToken)).status, 403);
  assert.equal((await read('systemConfig/gameplay', member.idToken)).status, 403);
});
