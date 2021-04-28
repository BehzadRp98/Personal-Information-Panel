const mongoose = require('mongoose')

const ContactsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    author: String,
    message: String,
    sender: String,
    response: String
})

var ContactsModel = mongoose.model('Contacts', ContactsSchema)

module.exports = ContactsModel;