const mongoose = require('mongoose')

const HistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },

    // Educational History
    university: [],
    // grade: String,
    // major: String,
    // university: String,
    // endYear: String,
    // eduDescription: String,

    // Perofessional History
    job: [],
    // job: String,
    // post: String,
    // place: String,
    // expYear: String,
    // wDescription: String,

    // Abilities
    ability: [],
    // myRange: []
})

var HistoryModel = mongoose.model('History', HistorySchema)

module.exports = HistoryModel;