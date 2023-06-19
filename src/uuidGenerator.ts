const crypto = require('crypto');
const { v5: uuidv5 } = require('uuid');

function generateUUID(input: any) {
  const hash = crypto.createHash('sha1').update(input).digest('hex');
  return uuidv5(hash, uuidv5.URL);
}

module.exports = generateUUID;
