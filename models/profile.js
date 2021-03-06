const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    phoneNumber: String,
    birthdayDate: String,
    biography: String,
    photoAddress: String,
    website: String,
    telegram: String,
    instagram: String
})

var ProfileModel = mongoose.model('Profile', ProfileSchema)

module.exports = ProfileModel;