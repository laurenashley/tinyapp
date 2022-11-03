// helpers.js

const bcrypt = require('bcryptjs');

const isLoggedIn = (req) => {
    return req.session.user_id;
};

const getUserByEmail = (val, users) => {
  const myUser = Object.values(users).filter((user) => {
    return user.email === val
  });
  return myUser.length === 0 ? undefined : myUser[0];
};

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const validatePassword = (user, hashedPassword) => {
  return bcrypt.compareSync(user['hashedPassword'], hashedPassword);
};

const generateRandomString = () => {
  const randomNum = Math.random().toString(20); // Specify radix, base to use for numeric vals
  return randomNum.substring(2, 8);
};

const urlsForUser = (id, db) => {
  const entries = Object.entries(db);
  const myUrls = [];
  // eslint-disable-next-line no-restricted-syntax
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
  urlsForUser
};
