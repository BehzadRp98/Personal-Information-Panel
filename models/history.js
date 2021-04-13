const mongoose = require('mongoose')

const HistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },

    // Educational History
    grade: String,
    major: String,
    university: String,
    endYear: String,
    eduDescription: String,

    // Perofessional History
    job: String,
    post: String,
    place: String,
    expYear: String,
    wDescription: String,

    // Abilities
    ability: String,
    myRange: String
})

var HistoryModel = mongoose.model('History', HistorySchema)

module.exports = HistoryModel;