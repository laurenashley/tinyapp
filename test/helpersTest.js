/* eslint-disable quote-props */
const { assert } = require('chai');

const { getUserByEmail } = require('../helpers');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined with email not in our database', () => {
    const user = getUserByEmail('laur@example.com', testUsers);
    console.log('user returns undefined: ', user);
    assert.strictEqual(user, undefined);
  });
});