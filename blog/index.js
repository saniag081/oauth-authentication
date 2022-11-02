const express = require("express");
const path = require("path");
const request = require('request');
const { URLSearchParams } = require('url');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const generateRamdomString = require('./utils/generateRamdomString');
const encodeBasic = require('./utils/encodeBasic');
const scopesArray = require('./utils/scopesArrays');

const playlistsMocks = require('./utils/mocks/playlist');

const { config } = require('./config');

const app = express();

// static files
app.use("/static", express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//middlewares
app.use(cors());
app.use(cookieParser());

// routes
app.get("/", async function(req, res, next) {
  res.render("posts", { posts: [{
    title: "Guillermo's playlist",
    description: "Creatine supplementation is the reference compound for increasing muscular creatine levels; there is variability in this increase, however, with some nonresponders.",
    author: "Guillermo Rodas"
  }] });
});

app.get('/login', (req, res) => {
  const state = generateRamdomString(16);
  const queryString = new URLSearchParams({ // 0.0
    response_type: 'code',
    client_id: config.SPOTIFY_CLIENT_ID,
    scope: scopesArray.join(' '),
    redirect_uri: config.SPOTIFY_REDIRECT_URL,
    state,
  }).toString();

  res.cookie('auth_state', state, { httpOnly: true });
  res.redirect(`https://accounts.spotify.com/authorize?${queryString}`);
});

app.get('/callback', (req, res, next) => {
  const { code,  state } = req.query;
  const { auth_state } = req.cookies;

  if (state === null || state !== auth_state) {
    nest(new Error("The state doesn't match"));
  }

  res.clearCookie('auth_state');

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri: config.SPOTIFY_REDIRECT_URL,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: `Basic ${encodeBasic(
        config.SPOTIFY_CLIENT_ID,
        config.SPOTIFY_CLIENT_SECRET,        
      )}`,
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (error | response.statusCode !== 200) {
      next(new Error('The token is invalid'))
    }

    res.cookie('access_token', body.access_token, { httpOnly: true });
    res.redirect('/playlist');
  });
});

// server
const server = app.listen(3000, function() {
  console.log(`Listening http://localhost:${server.address().port}`);
});