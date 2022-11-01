/* eslint-disable quote-props */
const { assert } = require('chai');

const { isLoggedIn, getUserByEmail } = require('../helpers');

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

const sessionCookie = {
  session: {
    user_id: 'user2RandomID'
  }
};

describe('getUserByEmail', () => {
  it('should return the id of the user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined with non-existant email', () => {
    const user = getUserByEmail('laur@example.com', testUsers);
    assert.strictEqual(user, undefined);
  });
});

describe('isLoggedIn', () => {
  const userid = isLoggedIn(sessionCookie);
  const expectedUserID = 'user2RandomID';

  it('should return user ID if user is logged in', () => {
    assert.strictEqual(userid, expectedUserID);
  });
});
