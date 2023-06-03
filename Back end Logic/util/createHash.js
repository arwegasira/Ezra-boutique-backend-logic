
const crypto = require('crypto');
const createHash = (token)=>{
return crypto.createHash('md5').update(token).digest('hex');
}

module.exports = createHash;