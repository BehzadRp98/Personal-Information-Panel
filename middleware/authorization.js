const jwt = require('jsonwebtoken');

const PRIVATE_KEY = "PERSONAL_INFORMATION";

const verifyJWT = async function(req, res, next) {
    try {
        let token = req.headers.cookie.split(";")
        for (let t = 0; t < token.length; t++) {
            let temp = token[t].split('=')
            if (temp[0].replace(' ', '') === "pi_token") {
                token = temp[1]
                break
            }
        }

        let userInfo = jwt.verify(token, PRIVATE_KEY, async (err, data) => {
            if (err) {
                res.redirect('/users/login');
                return;
            };

            req.userInfo = {}
            req.userInfo.firstName = data.firstName
            req.userInfo.lastName = data.lastName
            req.userInfo.email = data.email
            req.userInfo.userID = data.id

            next();
        });

    } catch (e) {
        console.log(e);

        res.send({
            statusCode: 400
        });
        return;
    }
};

const generateJWT = async function(userInfo) {
    try {
        obj = {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            id: userInfo._id,
        };

        return await jwt.sign(obj, PRIVATE_KEY);
    } catch (e) {
        console.log(e);
        return null;
    }
};

module.exports.verifyJWT = verifyJWT;
module.exports.generateJWT = generateJWT;
