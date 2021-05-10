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
  let profileInfo = await profileControllers.selectProfileFromDB('608ec71b7a5f960e340f6d41')
  let historyInfo = await historyControllers.selectHistoryFromDB('608ec71b7a5f960e340f6d41')

  res.render('home', {
    userID: '608ec71b7a5f960e340f6d41',
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
  let profileInfo = await profileControllers.selectProfileFromDB('608ec71b7a5f960e340f6d41')
  let historyInfo = await historyControllers.selectHistoryFromDB('608ec71b7a5f960e340f6d41')

  res.render('resume', {
    userID: '608ec71b7a5f960e340f6d41',
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
//   let profileInfo = await profileControllers.selectProfileFromDB('608ec71b7a5f960e340f6d41')
//   let historyInfo = await historyControllers.selectHistoryFromDB('608ec71b7a5f960e340f6d41')

//   res.render('portfolio', {
//     firstName: profileInfo.user.firstName,
//     lastName: profileInfo.user.lastName,
//     email: profileInfo.user.email,
//     birthdayDate: profileInfo.birthdayDate,
//     job: historyInfo.job,
//   })
// })

router.get('/blog', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB('608ec71b7a5f960e340f6d41')
  let historyInfo = await historyControllers.selectHistoryFromDB('608ec71b7a5f960e340f6d41')
  let blogsInfo = await blogControllers.selectBlogsFromDB('608ec71b7a5f960e340f6d41')

  for (let i in blogsInfo) {
    let temp = blogsInfo[i].date
    temp = String(temp).split(' ')
    temp = temp[1] + ' ' + temp[3]
    blogsInfo[i].date1 = temp
  }

  res.render('blog', {
    userID: '608ec71b7a5f960e340f6d41',
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    job: historyInfo.job,
    blogs: blogsInfo
  })
})

router.get('/blog/:id', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB('608ec71b7a5f960e340f6d41')
  let historyInfo = await historyControllers.selectHistoryFromDB('608ec71b7a5f960e340f6d41')
  let blogInfo = await blogControllers.selectBlogFromDB('608ec71b7a5f960e340f6d41', req.params.id)
  let blogsInfo = await blogControllers.selectBlogsFromDB('608ec71b7a5f960e340f6d41')
  
  for (let i in blogsInfo) {
    let temp = blogsInfo[i].date
    temp = String(temp).split(' ')
    temp = temp[1] + ' ' + temp[3]
    blogsInfo[i].date1 = temp
  }

  res.render('blog-page', {
    userID: '608ec71b7a5f960e340f6d41',
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    job: historyInfo.job,
    blogs: blogsInfo,
    post: blogInfo
  })
})

router.post('/comment/:id', async function(req, res, next) {
  req.body.blogID = req.params.id
  let insertCommentStatus = await blogControllers.insertCommentsToDB(req.body)

  if (insertCommentStatus) {
    res.redirect(`/blog/${req.params.id}`)
  }
})

router.get('/contact', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB('608ec71b7a5f960e340f6d41')
  let historyInfo = await historyControllers.selectHistoryFromDB('608ec71b7a5f960e340f6d41')
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
    userID: '608ec71b7a5f960e340f6d41',
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
  req.body.userID = '608ec71b7a5f960e340f6d41'
  let status = await contactControllers.insertContactToDB(req.body)
  if (status) {
    res.redirect('/contact?mc=200')
  }
  res.redirect('/contact?mc=400')
})

module.exports = router;
