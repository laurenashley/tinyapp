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

const generateRandomString = () => {
  const randomNum = Math.random().toString(20); // Specify radix, base to use for numeric vals
  return randomNum.substring(2, 8);
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  console.log('email ', email);
  // find user by email
  res.cookie('user_id', email);
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  console.log('Cookies: ', req.cookies);
  const myUser = users[req.cookies.user_id];
  console.log('myUser ', myUser);
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies.username,
    user: myUser
  };
  console.log('templateVars ', templateVars);
  res.render('urls_index', templateVars);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  // console.log('cookies ', req.cookies);
  const myUser = users[req.cookies.user_id];
  // console.log('user ', myUser);
  const templateVars = { user: myUser };
  res.render('user_registration', templateVars);
});

app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const user = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };
  users[newUserID] = user;
  // console.log(req.cookies);
  res.cookie('user_id', newUserID);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const id = generateRandomString();
  // console.log(req.body); // Log the POST request body to the console
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/edit', (req, res) => {
  // console.log(req.body);
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  // console.log(urlDatabase);
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
  const myUser = users[req.cookies.user_id];
  const templateVars = { user: myUser};
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const myID = req.params.id;
  const templateVars = {
    id: myID,
    longURL: urlDatabase[myID],
    username: req.cookies.username
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