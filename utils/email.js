var sendmail = require('sendmail')({
    silent: true,
    devHost: '127.0.0.1:3000', // Default: localhost
})
var handlebars = require('handlebars');
var fs = require('fs');

const sendVerificationEmail = function(obj) {
    var readHTMLFile = function(path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
            if (err) {
                throw err;
                callback(err);
            } else {
                callback(null, html);
            }
        });
    };

    readHTMLFile('public/emailTemplate.html', function(err, html) {
        var template = handlebars.compile(html);
        var replacements = Object

        replacements = {
            question: obj.question,
            answer: obj.answer,
            url: `http://localhost:3000/contact?id=${obj.userInfo.userID}`,
            
        };
        var htmlToSend = template(replacements);

        if (err) {
            console.log(e)
        }

        sendmail({
            from: obj.userInfo.email,
            to: obj.email,
            subject: obj.userInfo.firstName + ' ' + obj.userInfo.lastName,
            html: htmlToSend
        }, function(err, reply) {
            if (err) {
                console.log('email not send')
                console.log(err)
            } else {
                console.log('email send')
            }
        })
    })
}

module.exports.sendVerificationEmail = sendVerificationEmail;
