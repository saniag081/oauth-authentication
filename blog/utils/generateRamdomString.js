const generateRamdomString = (length) => {
  let ramdomString = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    ramdomString += possibleChars.charAt(
      Math.floor(Math.random() * possibleChars.length)
    )
  }

  return ramdomString;
};

module.exports = generateRamdomString;
