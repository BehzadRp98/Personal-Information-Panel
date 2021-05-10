const BlogsModel = require('../models/blogs')
const mongoose = require('mongoose')

var insertBlogToDB = async function(blogObj) {
    try {
        var newBlog = new BlogsModel({
            user: mongoose.Types.ObjectId(blogObj.userID),
            title: blogObj.title,
            content: blogObj.content,
        })

        return newBlog.save().then(data => {
            console.log(data.title + ' -> saved to Blogs Doc')
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

var selectBlogFromDB = async function(userID, blogID) {
    try {
        return BlogsModel.findOne({
            user: mongoose.Types.ObjectId(userID),
            _id: mongoose.Types.ObjectId(blogID)
        })
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

var selectBlogsFromDB = async function(userID) {
    try {
        return BlogsModel.find({
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

var updateBlogInDB = async function(obj) {
    try {
        return BlogsModel.updateOne({
            user: obj.userID,
            _id: obj.blogID
        }, {
            $set: {
                title: obj.title,
                content: obj.content,
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

var deleteBlogFromDB = async function(userID, blogID) {
    try {
        return BlogsModel.deleteOne({
            user: userID,
            _id: blogID
        })
        .then(data => {
            console.log(data)
            if (data.deletedCount == 1) {
                return true
            }
            return false
        }).catch(err => {
            console.log(err)
            return false
        })
    } catch(err) {
        console.log('EXCEPTION: ' + err)
        return false
    }
}

var insertCommentsToDB = async function(obj) {
    try {
        let comment = {
            author: obj.author,
            message: obj.comment
        };

        return BlogsModel.updateOne({
            _id: mongoose.Types.ObjectId(obj.blogID)
        }, {
            $addToSet: {
                comments: comment
            }
        }).then(data => {
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

module.exports.insertBlogToDB = insertBlogToDB
module.exports.selectBlogFromDB = selectBlogFromDB;
module.exports.selectBlogsFromDB = selectBlogsFromDB;
module.exports.updateBlogInDB = updateBlogInDB;
module.exports.deleteBlogFromDB = deleteBlogFromDB;
module.exports.insertCommentsToDB = insertCommentsToDB;