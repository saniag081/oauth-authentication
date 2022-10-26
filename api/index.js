const express = require('express');
const bodyParse = require('body-parser');
const jwt = require('jsonwebtoken');
const { config } = require('./config');

const app = express();

app.use(express.json());

app.post('/api/auth/token', (req, res) => {
  const { email, username, name } = req.body;
  const token = jwt.sign({ sub: username, email, name }, config.authJwtSecret);
  res.json({ access_token: token });
});

app.get('/api/auth/verify', (req, res, next) => {
  const { access_token } = req.query;

  try {
    const decode = jwt.verify(access_token, config.authJwtSecret);
    res.json({
      message: "the access token is valid",
      username: decode.sub,
    });
  } catch(err) {
    next(err);
  }
});

const server = app.listen(5001, () => {
  console.log(`listening http://localhost:${server.address().port}`);
});
