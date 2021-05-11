const CommentsModel = require('../models/comments')
const mongoose = require('mongoose')

var insertCommentToDB = async function(commentObj) {
    try {
        var newComment = new CommentsModel({
            blog: mongoose.Types.ObjectId(commentObj.blogID),
            author: commentObj.author,
            message: commentObj.comment,
        })

        return newComment.save().then(data => {
            console.log(data._id + ' -> saved to Comments Doc')
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

var selectCommentFromDB = async function(blogID, commentID) {
    try {
        return CommentsModel.findOne({
            blog: mongoose.Types.ObjectId(blogID),
            _id: mongoose.Types.ObjectId(commentID)
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

var selectCommentsFromDB = async function(blogID) {
    try {
        return CommentsModel.find({
            blog: mongoose.Types.ObjectId(blogID)
        }).populate('blog')
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

var updateCommentInDB = async function(obj) {
    try {
        return CommentsModel.updateOne({
            blog: mongoose.Types.ObjectId(obj.blogID),
            _id: mongoose.Types.ObjectId(obj.commentID)
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

var deleteCommentFromDB = async function(blogID, commentID) {
    try {
        return CommentsModel.deleteOne({
            blog: mongoose.Types.ObjectId(blogID),
            _id: mongoose.Types.ObjectId(commentID)
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

var insertReplyToDB = async function(obj) {
    try {
        let reply = {
            author: obj.author,
            message: obj.comment
        };

        return CommentsModel.updateOne({
            _id: mongoose.Types.ObjectId(obj.commentID)
        }, {
            $addToSet: {
                reply: reply
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

module.exports.insertCommentToDB = insertCommentToDB
module.exports.selectCommentFromDB = selectCommentFromDB;
module.exports.selectCommentsFromDB = selectCommentsFromDB;
module.exports.updateCommentInDB = updateCommentInDB;
module.exports.deleteCommentFromDB = deleteCommentFromDB;
module.exports.insertReplyToDB = insertReplyToDB;