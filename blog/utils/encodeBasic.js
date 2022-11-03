
function encodeBasic(username, password) {
    return globalThis.Buffer.from(`${username}:${password}`).toString("base64");
};

module.exports = encodeBasic;
