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

const server = app.listen(5001, () => {
  console.log(`listening http://localhost:${server.address().port}`);
});
