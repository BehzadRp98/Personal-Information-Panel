const crypto = require('crypto');

const getPasswordHash = async function(password) {
    try {
        const sha256 = crypto.createHash('sha256');
        const hash = sha256.update(password).digest('base64');
        
        return hash;
    }
    catch(e) {
        console.log(e);
        return null;
    }
}

module.exports.getPasswordHash = getPasswordHash;