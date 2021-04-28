var express = require('express');
var router = express.Router();

// Controllers functions
var usersControllers = require('../controllers/users');
var profileControllers = require('../controllers/profile');
var historyControllers = require('../controllers/history');
var blogControllers = require('../controllers/blogs');
var contactControllers = require('../controllers/contact');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/home', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB('6054e79f9fcccd435cfe7e4b')
  let historyInfo = await historyControllers.selectHistoryFromDB('6054e79f9fcccd435cfe7e4b')

  res.render('home', {
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    biography: profileInfo.biography,
    job: historyInfo.job,
    ability: historyInfo.ability,
    myRange: historyInfo.myRange
  });
})

router.get('/resume', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB('6054e79f9fcccd435cfe7e4b')
  let historyInfo = await historyControllers.selectHistoryFromDB('6054e79f9fcccd435cfe7e4b')

  res.render('resume', {
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    grade: historyInfo.grade,
    major: historyInfo.major,
    university: historyInfo.university,
    endYear: historyInfo.endYear,
    eduDescription: historyInfo.eduDescription,
    job: historyInfo.job,
    post: historyInfo.post,
    place: historyInfo.place,
    expYear: historyInfo.expYear,
    wDescription: historyInfo.wDescription,
  })
})

// router.get('/portfolio', async function(req, res, next) {
//   let profileInfo = await profileControllers.selectProfileFromDB('6054e79f9fcccd435cfe7e4b')
//   let historyInfo = await historyControllers.selectHistoryFromDB('6054e79f9fcccd435cfe7e4b')

//   res.render('portfolio', {
//     firstName: profileInfo.user.firstName,
//     lastName: profileInfo.user.lastName,
//     email: profileInfo.user.email,
//     birthdayDate: profileInfo.birthdayDate,
//     job: historyInfo.job,
//   })
// })

router.get('/blog', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB('6054e79f9fcccd435cfe7e4b')
  let historyInfo = await historyControllers.selectHistoryFromDB('6054e79f9fcccd435cfe7e4b')

  res.render('blog', {
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    job: historyInfo.job,
  })
})

router.get('/contact', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB('6054e79f9fcccd435cfe7e4b')
  let historyInfo = await historyControllers.selectHistoryFromDB('6054e79f9fcccd435cfe7e4b')
  let responseMessage = ''
  let responseClass = ''

  if (req.query.mc == '200') {
    responseMessage = 'تیکت شما با موفقیت ایجاد شد!'
    responseClass = 'alert-success'
  } else if (req.query.mc == '400') {
    responseMessage = 'خطا در ذخیره تیکت. لطفا دوباره تلاش کنید!'
    responseClass = 'alert-danger'
  }

  res.render('contact', {
    responseMessage: responseMessage,
    responseClass: responseClass,
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    phoneNumber: profileInfo.phoneNumber,
    birthdayDate: profileInfo.birthdayDate,
    job: historyInfo.job,
  })
})

router.post('/contact', async function(req, res, next) {
  req.body.userID = '6054e79f9fcccd435cfe7e4b'
  let status = await contactControllers.insertContactToDB(req.body)
  if (status) {
    res.redirect('/contact?mc=200')
  }
  res.redirect('/contact?mc=400')
})

module.exports = router;
