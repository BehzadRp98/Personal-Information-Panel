const mongoose = require('mongoose')

const UsersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
})

var UsersModel = mongoose.model('Users', UsersSchema)

module.exports = UsersModel;