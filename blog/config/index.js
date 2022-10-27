require('dotenv').config();

const config = {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URL: process.env.SPOTIFY_REDIRECT_URL,
};

module.exports = { config };