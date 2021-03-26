const ProfileModel = require('../models/profile')
const mongoose = require('mongoose')

var insertProfileToDB = async function(profileObj) {
    try {
        var newProfile = new ProfileModel({
            // user: profileObj.userID,
            user: mongoose.Types.ObjectId('6054e79f9fcccd435cfe7e4b'),
            phoneNumber: profileObj.phoneNumber,
            birthdayDate: profileObj.birthdayDate,
            biography: profileObj.biography,
            photoAddress: profileObj.photoAddress
        })

        return newProfile.save().then(data => {
            console.log(data.user + ' -> saved to Profile Doc')
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

var selectProfileFromDB = async function(userID) {
    try {
        return ProfileModel.findOne({
            user: userID
        }).populate('user')
        .then(data => {
            return data
        }).catch(err => {
            console.log(err)
            return null
        })
    } catch(err) {
        console.log('EXCEPTION: ' + err)
        return null
    }
}

module.exports.insertProfileToDB = insertProfileToDB
module.exports.selectProfileFromDB = selectProfileFromDB