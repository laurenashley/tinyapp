const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080

const {
  isLoggedIn,
  getUserByEmail,
  hashPassword,
  validatePassword,
  generateRandomString,
  urlsForUser
} = require('./helpers');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key-goes-here', 'your-secret-key-goes-here']
}));

const urlDatabase = require('./data_files/database_urls.json');
const users = require('./data_files/database_user.json');

const notLoggedInMessage = 'You must be registered and logged in to create a new short URL or to edit or delete them.';

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  isLoggedIn(req) ? res.redirect('/urls') : res.redirect('/login');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/login', (req, res) => {
  const templateVars = { user: undefined }; // To Do get rid of this, template breaks without it

  isLoggedIn(req) ? res.redirect('/urls') : res.render('user_login', templateVars);
});

app.get('/urls', (req, res) => {
  const myid = req.session.user_id;
  const myUser = users[myid];
  const myDB = isLoggedIn(req) ? urlsForUser(myUser.id, urlDatabase) : urlDatabase;
  const templateVars = {
    urls: myDB, // Attn if anon user can view url list see const ln 112
    user: myUser
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    const myUser = users[req.session.user_id];
    const templateVars = { user: myUser };
    res.render('user_registration', templateVars);
  }
});

app.get('/u/:id', (req, res) => {
  if (isLoggedIn(req)) {
    const { longURL } = urlDatabase[req.params.id];
    res.redirect(longURL);
  } else {
    // console.log('Not logged in');
    res.status(403).send(notLoggedInMessage);
  }
});

app.get('/urls/new', (req, res) => {
  if (isLoggedIn(req)) {
    const myUser = users[req.session.user_id];
    const templateVars = { user: myUser};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  if (isLoggedIn(req)) {
    console.log(`${req.session.user_id} is logged in`);
    const urlOwner = '';
    // if this url does not belong to logged in user, tell them they do not have permission
    const notOwnedMessage = 'Oops! This short URL does not belong to you. Only the owner of this url can access this page';
    if (urlDatabase[myID] !== undefined) { // To Do && urldb[userid] matches userid
      const myURL = urlDatabase[myID].longURL;
      const templateVars = {
        id: urlID,
        longURL: myURL,
        user: users[req.session.user_id]
      };
      res.render('urls_show', templateVars);
    } else {
      console.log('ID not found');
      res.status(404).send(notOwnedMessage);
    }
  } else {
    console.log('Not logged in');
    res.status(403).send(notLoggedInMessage);
  }
});

// Endpoint to login user using their email and password
app.post('/login', (req, res) => {
  const { email } = req.body;
  const hashedPassword = hashPassword(req.body.password);
  const myUser = getUserByEmail(email, users);
  if (myUser !== undefined) {
    // check password matches user password
    if (validatePassword(myUser, hashedPassword)) {
      req.session.user_id = myUser.id;
      res.redirect('/urls');
    } else {
      // console.log('Not logged in Forbidden');
      res.sendStatus(403);
    }
  } else {
    // console.log('Not logged in Forbidden');
    res.sendStatus(403);
  }
});

// Endpoint to logout user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Endpoint to register user using their email and password
app.post('/register', (req, res) => {
  const hashedPassword = hashPassword(req.body.password);
  const { email } = req.body;
  const emailExists = getUserByEmail(email, users) !== undefined;
  if (email !== '' && hashedPassword !== '' && !emailExists) {
    const newUserID = generateRandomString();
    const user = {
      id: newUserID,
      email,
      hashedPassword
    };
    users[newUserID] = user;
    req.session.user_id = newUserID;
    res.redirect('/urls');
  } else {
    // console.log('Not logged in Forbidden');
    res.sendStatus(404);
  }
});

// Endpoint to create new short url using entered long url
app.post('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    // user is not logged in, send message
    // console.log('Not logged in');
    res.status(403).send(notLoggedInMessage);
  } else {
    const id = generateRandomString();
    const newURL = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    urlDatabase[id] = newURL;
    res.redirect(`/urls/${id}`);
  }
});

// Endpoint to update existing short url using new long url
app.post('/urls/:id/edit', (req, res) => { // To Do make sure url get updated
  if (isLoggedIn(req)) {
    const { id } = req.params;
    urlDatabase[id] = { 
      longURL: req.body.newURL,
      userID: req.session.user_id
    };
    res.redirect('/urls');
  } else {
    // console.log('Not logged in');
    res.status(403).send(notLoggedInMessage);
  }
});

// Endpoint to delete existing url
app.post('/urls/:id/delete', (req, res) => {
  if (isLoggedIn(req)) {
    const { id } = req.params;
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    // console.log('Not logged in');
    res.status(403).send(notLoggedInMessage);
  }
});
