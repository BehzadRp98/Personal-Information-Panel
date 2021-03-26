const UsersModel = require('../models/users')

var insertUserToDB = async function(userObj) {
    try {
        var newUser = new UsersModel({
            firstName: userObj.firstName,
            lastName: userObj.lastName,
            email: userObj.email,
            password: userObj.password
        })

        return newUser.save().then(data => {
            console.log(data.email + ' -> saved to Users Doc')
            return true
        }).catch(err => {
            console.log(err)
            return false
        })
    } catch(err) {
        console.log('EXCEPTION: ' + err)
        return false
    }
}

var selectUserFromDB = async function(obj) {
    try {
        return UsersModel.findOne({
            email: obj.email,
            password: obj.password
        }).then(data => {
            console.log(data.email)
            return data
        }).catch(err => {
            console.log(err)
            return null
        })
    } catch (err) {
        console.log('EXCEPTION: ' + err)
        return null
    }
}

module.exports.insertUserToDB = insertUserToDB;
module.exports.selectUserFromDB = selectUserFromDB;