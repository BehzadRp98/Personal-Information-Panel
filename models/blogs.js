const mongoose = require('mongoose')

const BlogsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    content: String,
    title: String
})

var BlogsModel = mongoose.model('Blogs', BlogsSchema)

module.exports = BlogsModel;