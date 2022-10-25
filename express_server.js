const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.ca',
    userID: 'userRandomID'
  }
}

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  }
};

const getUserByEmail = (val) => {
  const myUser = Object.values(users).filter((user) => {
    return user.email === val
  });
  return myUser.length === 0 ? undefined : myUser[0];
};

const validatePassword = (user, val) => {
  return user.password === val;
};

const isLoggedIn = (req) => {
  return req.cookies.userid;
};

const notLoggedInMessage = 'You must be registered and logged in to create a new short URL or to edit or delete them.';

const generateRandomString = () => {
  const randomNum = Math.random().toString(20); // Specify radix, base to use for numeric vals
  return randomNum.substring(2, 8);
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  const templateVars = { user: undefined }; // To Do get rid of this, template breaks without it

  isLoggedIn(req) ? res.redirect('/urls') : res.render('user_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const myUser = getUserByEmail(email);
  if (myUser !== undefined) {
    // check password matches user password
    if (validatePassword(myUser, password)) {
      res.cookie('userid', myUser.id);
      res.redirect('/urls');
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

app.get('/urls', (req, res) => {
  const myid = req.cookies.userid;
  const myUser = users[myid];
  const templateVars = {
    urls: urlDatabase,
    user: myUser
  };
  res.render('urls_index', templateVars);
});

app.post('/logout', (req, res) => {
  res.clearCookie('userid');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    const myUser = users[req.cookies.userid];
    const templateVars = { user: myUser };
    res.render('user_registration', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const emailExists = getUserByEmail(email) !== undefined;
  if (email !== '' && password !== '' && !emailExists) {
    const newUserID = generateRandomString();
    const user = {
      id: newUserID,
      email,
      password
    };
    users[newUserID] = user;
    res.cookie('userid', newUserID);
    res.redirect('/urls');
  } else {
    res.sendStatus(404);
  }
});

app.post('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    // user is not logged in, send message
    res.status(403).send(notLoggedInMessage);
  } else {
    const id = generateRandomString();
    urlDatabase[id] = { longURL: req.body.longURL };
    res.redirect(`/urls/${id}`);
  }
});

app.post('/urls/:id/edit', (req, res) => {
  if (isLoggedIn(req)) {
    const id = req.params.id;
    urlDatabase[id] = { longURL: req.body.newURL };
    res.redirect('/urls');
  } else {
    res.status(403).send(notLoggedInMessage);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  if (isLoggedIn(req)) {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.status(403).send(notLoggedInMessage);
  }
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]['longURL'];
  res.redirect(longURL);
});

app.get('/urls/new', (req, res) => {
  if (isLoggedIn(req)) {
    const myUser = users[req.cookies.userid];
    const templateVars = { user: myUser};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  const myID = req.params.id;
  const myURL = urlDatabase[myID]['longURL'];
  if (myURL) {
    const templateVars = {
      id: myID,
      longURL: myURL,
      user: users[req.cookies.userid]
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(404).send('Short URL id not found');
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