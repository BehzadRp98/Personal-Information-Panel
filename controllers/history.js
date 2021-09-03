const HistoryModel = require('../models/history')
const mongoose = require('mongoose')

var insertHistoryToDB = async function(historyObj) {
    try {
        var newHistory = new HistoryModel({
            user: mongoose.Types.ObjectId(historyObj.userID),

            // Educational History
            university: historyObj.universities,
            // grade: historyObj.grade,
            // major: historyObj.major,
            // university: historyObj.university,
            // endYear: historyObj.endYear,
            // eduDescription: historyObj.eduDescription,

            // Perofessional History
            job: historyObj.jobs,
            // job: historyObj.job,
            // post: historyObj.post,
            // place: historyObj.place,
            // expYear: historyObj.expYear,
            // wDescription: historyObj.wDescription,

            // Abilities
            ability: historyObj.ability,
            // myRange: historyObj.myRange
        })

        return newHistory.save().then(data => {
            console.log(data._id + ' -> saved to History Doc')
            return true
        }).catch(err => {
            console.log(err)
            return false
        })
    } catch (err) {
        console.log('EXCEPTION: ' + err)
        return false
    }
}

var selectHistoryFromDB = async function(userID) {
    try {
        return HistoryModel.findOne({
                user: userID
            })
            .then(data => {
                return data
            }).catch(err => {
                console.log(err)
                return null
            })
    } catch (err) {
        console.log('EXCEPTION: ' + err)
        return null
    }
}

var updateHistoryInDB = async function(historyObj) {
    try {
        return HistoryModel.updateOne({
                user: historyObj.userID
            }, {
                $set: {
                    // Educational History
                    university: historyObj.universities,
                    // grade: historyObj.grade,
                    // major: historyObj.major,
                    // university: historyObj.university,
                    // endYear: historyObj.endYear,
                    // eduDescription: historyObj.eduDescription,

                    // Perofessional History
                    job: historyObj.jobs,
                    // job: historyObj.job,
                    // post: historyObj.post,
                    // place: historyObj.place,
                    // expYear: historyObj.expYear,
                    // wDescription: historyObj.wDescription,

                    // Abilities
                    ability: historyObj.ability,
                    // myRange: historyObj.myRange
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
    } catch (err) {
        console.log('EXCEPTION: ' + err)
        return null
    }
}

var deleteHistoryFromDB = async function(userID) {
    try {
        return HistoryModel.deleteOne({
                user: userID
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
    } catch (err) {
        console.log('EXCEPTION: ' + err)
        return false
    }
}

module.exports.insertHistoryToDB = insertHistoryToDB
module.exports.selectHistoryFromDB = selectHistoryFromDB;
module.exports.updateHistoryInDB = updateHistoryInDB;
module.exports.deleteHistoryFromDB = deleteHistoryFromDB;