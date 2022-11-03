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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

function getUserInfo(accessToken) {
  if (!accessToken) {
    return Promise.resolve(null);
  }

  const options = {
    url: "https://api.spotify.com/v1/me",
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(options, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        reject(error);
      }

      resolve(body);
    });
  });
}

function getUserPlaylists(accessToken, userId) {
  if (!accessToken || !userId) {
    return Promise.resolve(null);
  }

  const options = {
    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
    headers: { Authorization: `Bearer ${accessToken}` },
    json: true
  };

  return new Promise((resolve, reject) => {
    request.get(options, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        reject(error);
      }

      resolve(body);
    });
  });
}

// routes
app.get("/", async function(req, res, next) {
  const { access_token: accessToken } = req.cookies;

  try {
    const userInfo = await getUserInfo(accessToken);

    res.render("playlist", {
      userInfo,
      isHome: true,
      playlists: { items: playlistsMocks },
    });
  } catch(err) {
    next(err);
  }
});

app.get('/playlists', async (req, res, next) => {
  const { access_token: accessToken } = req.cookies;

  if (!accessToken) return redirect('/');

  try {
    const userInfo = await getUserInfo(accessToken);
    const userPlaylist = await getUserPlaylists(accessToken, userInfo.id);
    res.render("playlist", { userInfo, playlists: userPlaylist })
  } catch(err) {
    next(err);
  }
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

  res.cookie("auth_state", state, { httpOnly: true });
  res.redirect(`https://accounts.spotify.com/authorize?${queryString}`);
});

app.get("/logout", function(req, res) {
  res.clearCookie("access_token");
  res.redirect("/");
});

app.get('/callback', (req, res, next) => {
  const { code,  state } = req.query;
  const { auth_state } = req.cookies;
 // console.log(code);
// console.log(auth_state)
  if (state === null || state !== auth_state) {
    next(new Error("The state doesn't match"));
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
      next(new Error('The token is invalid'));
    }

    res.cookie('access_token', body.access_token, { httpOnly: true });
    res.redirect('/playlist');
  });
});

// server
const server = app.listen(3000, function() {
  console.log(`Listening http://localhost:${server.address().port}`);
});