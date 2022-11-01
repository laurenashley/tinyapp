// helpers.js

const getUserByEmail = (val, users) => {
  const myUser = Object.values(users).filter((user) => {
    return user.email === val
  });
  return myUser.length === 0 ? undefined : myUser[0];
};

module.exports = { getUserByEmail };