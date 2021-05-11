const mongoose = require('mongoose')
const moment = require('jalali-moment');

const CommentsSchema = new mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blogs'
    },
    author: String,
    message: String,
    date: {
        type: Date,
        default: moment().locale('en').format('YYYY-MM-DD')
    },
    reply: [{
        author: String,
        message: String,
        date: {
            type: Date,
            default: moment().locale('en').format('YYYY-MM-DD')
        },
    }]

})

var CommentsModel = mongoose.model('Comments', CommentsSchema)

module.exports = CommentsModel;