require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongooseencrypt = require('mongoose-encryption');


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const usersSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const secret = process.env.SECRET
usersSchema.plugin(mongooseencrypt, { secret, encryptedFields: ['password'] });

const User = new mongoose.model('User', usersSchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({
      email: username,
      password,
    });
    await newUser.save();
    res.render('secrets');
  } catch (err) {
    res.status(400).send({ errorMessage: err });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser && foundUser.password === password) {
        res.render('secrets');
      }
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started at the port ${process.env.PORT || 3000}`);
});
