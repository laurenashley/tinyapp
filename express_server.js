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

const urlDatabase = require('./server/database_urls.json');
console.log('urldb ', urlDatabase);
const users = require('./server/database_user.json');
console.log('userdb ', users);

// const urlDatabase = {
//   'b2xVn2': {
//     longURL: 'http://www.lighthouselabs.ca',
//     userID: 'userRandomID'
//   },
//   '9sm5xK': {
//     longURL: 'http://www.google.ca',
//     userID: 'userRandomID'
//   },
//   '9s34xK': {
//     longURL: 'http://www.hello.ca',
//     userID: 'hcjb66'
//   },
//   '85uu23': {
//     longURL: 'http://www.googler.ca',
//     userID: 'hcjb66'
//   }
// };

// const users = {
//   userRandomID: {
//     id: 'userRandomID',
//     email: 'user@example.com',
//     hashedPassword: 'purple-monkey-dinosaur',
//   },
//   hcjb66: {
//     id: 'hcjb66',
//     email: 'laurfaery@me.com',
//     hashedPassword: '123',
//   }
// };

const notLoggedInMessage = 'You must be registered and logged in to create a new short URL or to edit or delete them.';

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  const templateVars = { user: undefined }; // To Do get rid of this, template breaks without it

  isLoggedIn(req) ? res.redirect('/urls') : res.render('user_login', templateVars);
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

// Endpoint to logout user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
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
  const myID = req.params.id;
  if (isLoggedIn(req)) {
    if (urlDatabase[myID] !== undefined) {
      const myURL = urlDatabase[myID].longURL;
      const templateVars = {
        id: myID,
        longURL: myURL,
        user: users[req.session.user_id]
      };
      res.render('urls_show', templateVars);
    } else {
      // console.log('ID not found');
      res.status(404).send('Short URL id not found');
    }
  } else {
    // console.log('Not logged in');
    res.status(403).send(notLoggedInMessage);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
