var express = require('express');
var router = express.Router();

// Controllers functions
var usersControllers = require('../controllers/users');
var profileControllers = require('../controllers/profile');
var historyControllers = require('../controllers/history');
var blogControllers = require('../controllers/blogs');
var commentControllers = require('../controllers/comments');
var contactControllers = require('../controllers/contact');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let admins = await usersControllers.selectUsersFromDB()
  for (let a in admins) {
    let temp = await historyControllers.selectHistoryFromDB(admins[a]._id)
    admins[a].job = temp && temp.job ? temp.job : ''
    console.log('')
  }
  res.render('index', {
    admins: admins
  });
});

router.get('/home', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB(req.query.id)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.query.id)

  res.render('home', {
    userID: req.query.id,
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    biography: profileInfo.biography,
    website: profileInfo.website,
    telegram: profileInfo.telegram,
    instagram: profileInfo.instagram,
    job: historyInfo.job,
    ability: historyInfo.ability,
    myRange: historyInfo.myRange,
  });
})

router.get('/resume', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB(req.query.id)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.query.id)

  res.render('resume', {
    userID: req.query.id,
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    website: profileInfo.website,
    telegram: profileInfo.telegram,
    instagram: profileInfo.instagram,
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

router.get('/blog', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB(req.query.id)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.query.id)
  let blogsInfo = await blogControllers.selectBlogsFromDB(req.query.id)

  for (let i in blogsInfo) {
    let temp = blogsInfo[i].date
    temp = String(temp).split(' ')
    temp = temp[1] + ' ' + temp[3]
    blogsInfo[i].date1 = temp
  }

  res.render('blog', {
    userID: req.query.id,
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    website: profileInfo.website,
    telegram: profileInfo.telegram,
    instagram: profileInfo.instagram,
    job: historyInfo.job,
    blogs: blogsInfo
  })
})

router.get('/blog/:id', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB(req.query.id)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.query.id)
  let blogInfo = await blogControllers.selectBlogFromDB(req.query.id, req.params.id)
  let blogsInfo = await blogControllers.selectBlogsFromDB(req.query.id)
  let commentsInfo = await commentControllers.selectCommentsFromDB(req.params.id)
  
  for (let i in blogsInfo) {
    let temp = blogsInfo[i].date
    temp = String(temp).split(' ')
    temp = temp[1] + ' ' + temp[3]
    blogsInfo[i].date1 = temp
  }

  res.render('blog-page', {
    userID: req.query.id,
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    birthdayDate: profileInfo.birthdayDate,
    website: profileInfo.website,
    telegram: profileInfo.telegram,
    instagram: profileInfo.instagram,
    job: historyInfo.job,
    blogs: blogsInfo,
    post: blogInfo,
    comments: commentsInfo
  })
})

router.post('/comment/:id', async function(req, res, next) {
  req.body.blogID = req.params.id
  let insertCommentStatus = false

  if (req.body.commentID.length > 0) {
    insertCommentStatus = await commentControllers.insertReplyToDB(req.body)
  } else {
    insertCommentStatus = await commentControllers.insertCommentToDB(req.body)
  }

  if (insertCommentStatus) {
    res.redirect(`/blog/${req.params.id}?id=${req.query.id}`)
  }
})

router.get('/contact', async function(req, res, next) {
  let profileInfo = await profileControllers.selectProfileFromDB(req.query.id)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.query.id)
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
    userID: req.query.id,
    responseMessage: responseMessage,
    responseClass: responseClass,
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    email: profileInfo.user.email,
    phoneNumber: profileInfo.phoneNumber,
    birthdayDate: profileInfo.birthdayDate,
    website: profileInfo.website,
    telegram: profileInfo.telegram,
    instagram: profileInfo.instagram,
    job: historyInfo.job,
  })
})

router.post('/contact', async function(req, res, next) {
  req.body.userID = req.query.id
  let status = await contactControllers.insertContactToDB(req.body)
  if (status) {
    res.redirect('/contact?mc=200')
  }
  res.redirect('/contact?mc=400')
})

module.exports = router;
