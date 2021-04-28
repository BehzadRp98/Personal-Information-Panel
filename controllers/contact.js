const ContactsModel = require('../models/contact')
const mongoose = require('mongoose')

var insertContactToDB = async function(contactObj) {
    try {
        var newContact = new ContactsModel({
            user: mongoose.Types.ObjectId(contactObj.userID),
            author: contactObj.author,
            message: contactObj.message,
            sender: contactObj.sender,
        })

        return newContact.save().then(data => {
            console.log(data.sender + ' -> saved to Contacts Doc')
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

var selectContactsFromDB = async function(obj) {
    try {
        return ContactsModel.find({
            user: obj.userID
        }).then(data => {
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

var updateContactInDB = async function(obj) {
    try {
        return ContactsModel.updateOne({
            user: obj.userID,
            _id: obj.ticketID
        }, {
            $set: {
                response: obj.response,
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

module.exports.insertContactToDB = insertContactToDB;
module.exports.selectContactsFromDB = selectContactsFromDB;
module.exports.updateContactInDB = updateContactInDB;