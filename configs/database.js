const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/personal_information', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', function() {
    console.log('Connection Successful!');
});

module.exports = db;