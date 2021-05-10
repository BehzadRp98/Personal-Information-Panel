const ProfileModel = require('../models/profile')
const mongoose = require('mongoose')

var insertProfileToDB = async function(profileObj) {
    try {
        var newProfile = new ProfileModel({
            // user: profileObj.userID,
            user: mongoose.Types.ObjectId(profileObj.userID),
            phoneNumber: profileObj.phoneNumber,
            birthdayDate: profileObj.birthdayDate,
            biography: profileObj.biography,
            photoAddress: profileObj.photoAddress,
            website: profileObj.website,
            telegram: profileObj.telegram,
            instagram: profileObj.instagram
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

var updateProfileInDB = async function(obj) {
    try {
        return ProfileModel.updateOne({
            user: obj.userID
        }, {
            $set: {
                phoneNumber: obj.phoneNumber,
                birthdayDate: obj.birthdayDate,
                biography: obj.biography,
                photoAddress: obj.photoAddress,
                website: obj.website,
                telegram: obj.telegram,
                instagram: obj.instagram
            }
        })
        .then(data => {
            console.log(data)
            if (data.nModified == 1) {
                return true
            }
            return false
        }).catch(err => {
            console.log(err)
            return false
        })
    } catch(err) {
        console.log('EXCEPTION: ' + err)
        return null
    }
}

module.exports.insertProfileToDB = insertProfileToDB
module.exports.selectProfileFromDB = selectProfileFromDB;
module.exports.updateProfileInDB = updateProfileInDB;