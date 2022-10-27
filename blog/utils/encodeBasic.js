function encodeBasic(username, password) {
    return Buffer.form(`${username}:${password}`).toString("base64");
};

module.exports = encodeBasic;
