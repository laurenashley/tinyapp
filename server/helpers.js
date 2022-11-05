// helpers.js

const bcrypt = require('bcryptjs');

const isLoggedIn = (req) => { return req.session.user_id };
const notLoggedInMessage = 'You must be registered and logged in to create a new short URL or to edit or delete them.';
const notOwnedMessage = 'Oops! This short URL does not belong to you. Only the owner of this url can access this page';

const getUserByEmail = (val, users) => {
  const myUser = Object.values(users).filter((user) => { return user.email === val });
  return myUser.length === 0 ? undefined : myUser[0];
};

const hashPassword = (password) => { return bcrypt.hashSync(password, 10) };

const validatePassword = (user, hashedPassword) => {
  console.log(user, hashedPassword);
  return bcrypt.compareSync(hashedPassword, user.hashedPassword);
};

const generateRandomString = () => {
  const randomNum = Math.random().toString(20); // Specify radix, base to use for numeric vals
  return randomNum.substring(2, 8);
};

const urlsForUser = (id, db) => {
  const entries = Object.entries(db);
  const myUrls = [];
  for (const obj of entries) {
    if (obj[1].userID === id) {
      myUrls.push(obj);
    }
  }
  return myUrls;
};

module.exports = {
  isLoggedIn,
  getUserByEmail,
  hashPassword,
  validatePassword,
  generateRandomString,
  urlsForUser,
  notLoggedInMessage,
  notOwnedMessage,
};
