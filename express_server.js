const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

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

const generateRandomString = () => {
  const randomNum = Math.random().toString(20); // Specify radix, base to use for numeric vals
  return randomNum.substring(2, 8);
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  const cookieExists = req.cookies.userid;
  const templateVars = { user: undefined }; // To Do get rid of this, template breaks without it

  cookieExists ? res.redirect('/urls') : res.render('user_login', templateVars);
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
  const cookieExists = req.cookies.userid;
  const myUser = users[req.cookies.userid];
  const templateVars = { user: myUser };

  cookieExists ? res.redirect('/urls') : res.render('user_registration', templateVars);
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
  const cookieExists = req.cookies.userid;
  if (!cookieExists) {
    // user not logged in , display HTML message
  } else {
    const id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/${id}`);
  }
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/urls/new', (req, res) => {
  const myUser = users[req.cookies.userid];
  const templateVars = { user: myUser};
  // if not logged in , redirect to /login
  myUser ? res.render('urls_new', templateVars) : res.redirect('/login');
});

app.get('/urls/:id', (req, res) => {
  const myID = req.params.id;
  const templateVars = {
    id: myID,
    longURL: urlDatabase[myID],
    user: users[req.cookies.userid]
  };
  res.render('urls_show', templateVars);
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