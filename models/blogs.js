const mongoose = require('mongoose')
const moment = require('jalali-moment');

const BlogsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    date: {
        type: Date,
        default: moment().locale('en').format('YYYY-MM-DD')
    },
    content: String,
    title: String,
})

var BlogsModel = mongoose.model('Blogs', BlogsSchema)

module.exports = BlogsModel;