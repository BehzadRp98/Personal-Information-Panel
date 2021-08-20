var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
 
var upload = multer({ storage: storage });

// Utils functions
var hashingUtil = require('../utils/hashing');
var emailUtil = require('../utils/email');

// Controllers functions
var usersControllers = require('../controllers/users');
var profileControllers = require('../controllers/profile');
var historyControllers = require('../controllers/history');
var blogControllers = require('../controllers/blogs');
var ticketsControllers = require('../controllers/contact');

// Middleware functions
var authorizationMiddleware = require('../middleware/authorization');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// GET register page content
router.get('/register', function(req, res, next) {
  res.render('register')
});

// POST register page content
router.post('/register', async function(req, res, next) {
  let registerObj = req.body

  if (registerObj.email.length == 0 || registerObj.firstName.length == 0 || registerObj.lastName.length == 0) {
    console.log('پرکردن فیلدها اجباری است')
    res.send(400)
    return
  }

  if (registerObj.password != registerObj.passwordConfirm) {
    console.log('پسوردهای وارد شده مغایرت دارند')
    res.send(400)
    return
  }
  
  registerObj.password = await hashingUtil.getPasswordHash(registerObj.password)

  let newUserCreationStatus = await usersControllers.insertUserToDB(registerObj)

  if (newUserCreationStatus) {
    setTimeout(function() {
      res.redirect('/users/login')
    }, 1000)
    return
  }
  
  res.sendStatus(400)
})

// GET login page content
router.get('/login', function(req, res, next) {
  // res.render('login')
  res.render('login', {
    success_msg: '',
    error_msg: ''
  })
})

// POST login page content
router.post('/login', async function(req, res, next) {
  let loginObj = req.body
  if (loginObj.email.length == 0 || loginObj.password.length == 0) {
    console.log('پرکردن فیلدها اجباری است')
    req.flash('success_msg', 'OK')
    // res.render('login', {
    //   success_msg: '',omodule

    //   error_msg: 'پرکردن فیلدها اجباری است'
    // })
    // res.sendStatus(400)
    return
  }

  loginObj.password = await hashingUtil.getPasswordHash(loginObj.password)

  let loginStatus = await usersControllers.selectUserFromDB(loginObj)

  if (loginStatus.password == loginObj.password) {
    let token = await authorizationMiddleware.generateJWT(loginStatus)
    console.log(token)
    res.cookie('pi_token', token)
    setTimeout(function() {
      res.redirect('/users/dashboard')
    }, 1000)
    return
  }

  res.sendStatus(400)
})

// GET dashboard page content
router.get('/dashboard', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let userInfo = await usersControllers.selectUserFromDB(req.userInfo)
  let profileInfo = await profileControllers.selectProfileFromDB(req.userInfo.userID)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.userInfo.userID)

  res.render('dashboard', {
    userID: req.userInfo.userID,
    job: historyInfo ? historyInfo.job : ' ',
    firstName: userInfo ? userInfo.firstName : '',
    lastName: userInfo ? userInfo.lastName : '',
    phoneNumber: profileInfo ? profileInfo.phoneNumber : '',
    birthdayDate: profileInfo ? profileInfo.birthdayDate : '',
    email: userInfo ? userInfo.email : '',
    website: profileInfo && profileInfo.website ? profileInfo.website : '',
    telegram: profileInfo && profileInfo.telegram ? profileInfo.telegram : '',
    instagram: profileInfo && profileInfo.instagram ? profileInfo.instagram : '',
    biography: profileInfo ? profileInfo.biography : '',
    photoAddress: profileInfo ? profileInfo.photoAddress : '',
    btnStatus: profileInfo ? (profileInfo.birthdayDate.length > 0 ||
              profileInfo.phoneNumber.length > 0 ||
              profileInfo.biography.length > 0 || 
              profileInfo.telegram.length > 0 || 
              profileInfo.instagram.length > 0 || 
              profileInfo.website.length > 0 ? true : false) : false
  })
})

// POST dashboard page content
router.post('/dashboard', upload.single('photoAddress'), authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let profileObj = req.body

  req.body.instagram = req.body.instagram.length > 0 && !String(req.body.instagram).includes('https') ? `https://instagram.com/${req.body.instagram}` : req.body.instagram
  req.body.telegram = req.body.telegram.length > 0 && !String(req.body.telegram).includes('https') ? `https://tlgrm.in/${req.body.telegram}` : req.body.telegram

  try {
    fs.rename(req.file.path, req.file.path.replace(req.file.originalname, req.userInfo.userID) + '_profile.png', function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
  } catch(err) {
    console.log(err)
  }

  let insertStatus = false
  profileObj.userID = req.userInfo.userID
  if (req.body.btnStatus == 'true') {
    insertStatus = await profileControllers.updateProfileInDB(profileObj)
    insertStatus = await usersControllers.updateUserInDB(profileObj)
    if (insertStatus) {
      let token = await authorizationMiddleware.generateJWT(profileObj)
      console.log(token)
      res.cookie('pi_token', token)
    }
  }

  insertStatus = await profileControllers.insertProfileToDB(profileObj)
  if (insertStatus) {
    console.log('Ok')
  } else {
    console.log('Nok')
  }
  res.redirect('/users/dashboard')
})

// GET history page content
router.get('/history', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let userInfo = await usersControllers.selectUserFromDB(req.userInfo)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.userInfo.userID)
  
  res.render('history', {
    userID: req.userInfo.userID,
    firstName: userInfo ? userInfo.firstName : '',
    lastName: userInfo ? userInfo.lastName : '',
    grade: historyInfo ? historyInfo.grade : '',
    major: historyInfo ? historyInfo.major : '',
    university: historyInfo ? historyInfo.university : '',
    endYear: historyInfo ? historyInfo.endYear : '',
    eduDescription: historyInfo ? historyInfo.eduDescription : '',

    // Perofessional History
    job: historyInfo ? historyInfo.job : '',
    post: historyInfo ? historyInfo.post : '',
    place: historyInfo ? historyInfo.place : '',
    expYear: historyInfo ? historyInfo.expYear : '',
    wDescription: historyInfo ? historyInfo.wDescription : '',

    // Abilities
    ability1: historyInfo && historyInfo.ability[0] ? historyInfo.ability[0] : '',
    ability2: historyInfo && historyInfo.ability[1] ? historyInfo.ability[1] : '',
    ability3: historyInfo && historyInfo.ability[2] ? historyInfo.ability[2] : '',
    ability4: historyInfo && historyInfo.ability[3] ? historyInfo.ability[3] : '',
    myRange1: historyInfo && historyInfo.myRange[0] ? historyInfo.myRange[0] : '0',
    myRange2: historyInfo && historyInfo.myRange[1] ? historyInfo.myRange[1] : '0',
    myRange3: historyInfo && historyInfo.myRange[2] ? historyInfo.myRange[2] : '0',
    myRange4: historyInfo && historyInfo.myRange[3] ? historyInfo.myRange[3] : '0',
    btnStatus: historyInfo == null ? false : true
  })
})

// POST history page content
router.post('/history', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let ability = []
  let myRange = []
  ability.push(req.body.ability1);
  ability.push(req.body.ability2);
  ability.push(req.body.ability3);
  ability.push(req.body.ability4);

  myRange.push(req.body.myRange1);
  myRange.push(req.body.myRange2);
  myRange.push(req.body.myRange3);
  myRange.push(req.body.myRange4);

  req.body.ability = ability
  req.body.myRange = myRange

  let historyObj = req.body
  let insertStatus = false
  historyObj.userID = req.userInfo.userID
  if (req.body.btnStatus == 'true') {
    insertStatus = await historyControllers.updateHistoryInDB(historyObj)
  } else {
    insertStatus = await historyControllers.insertHistoryToDB(historyObj)
  }
  if (insertStatus) {
    console.log('Ok')
  } else {
    console.log('Nok')
  }
  res.redirect('/users/history')
})

router.delete('/history', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let deleteStatus = await historyControllers.deleteHistoryFromDB('6054e79f9fcccd435cfe7e4b')
  if (deleteStatus) {
    console.log('Ok')
  } else {
    console.log('Nok')
  }
  res.redirect('/users/history')
})

// GET blogs page content
router.get('/blogs', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let userInfo = await usersControllers.selectUserFromDB(req.userInfo)
  let blogsInfo = await blogControllers.selectBlogsFromDB(req.userInfo.userID)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.userInfo.userID)

  let blogInfo = {
    title: '',
    content: '',
    _id: ''
  }
  if (req.query.id) {
    blogInfo = await blogControllers.selectBlogFromDB(req.userInfo.userID, req.query.id)
  }
  res.render('blogs', {
    userID: req.userInfo.userID,
    firstName: userInfo ? userInfo.firstName : '',
    lastName: userInfo ? userInfo.lastName : '',
    job: historyInfo ? historyInfo.job : ' ',
    blogs: blogsInfo,
    blog: blogInfo,
    btnStatus: blogInfo.title.length > 0 ||
              blogInfo.content.length > 0 ? true : false
  })
})

// POST blogs page content
router.post('/blogs', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let blogObj = req.body
  let insertStatus = false
  blogObj.userID = req.userInfo.userID
  if (req.body.btnStatus == 'true') {
    insertStatus = await blogControllers.updateBlogInDB(blogObj)
  } else {
    insertStatus = await blogControllers.insertBlogToDB(blogObj)
  }
  if (insertStatus) {
    console.log('Ok')
  } else {
    console.log('Nok')
  }
  res.redirect('/users/blogs')
})

// DELETE blogs page conent
router.get('/blogs/:blogID', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let deleteStatus = await blogControllers.deleteBlogFromDB(req.userInfo.userID, req.params.blogID)
  if (deleteStatus) {
    res.redirect('/users/blogs')
    return;
  }
  res.send(400)
})

// GET tickets page content
router.get('/tickets', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let userInfo = await usersControllers.selectUserFromDB(req.userInfo)
  let ticketsInfo = await ticketsControllers.selectContactsFromDB(req.userInfo)
  let historyInfo = await historyControllers.selectHistoryFromDB(req.userInfo.userID)
  let responseMessage = ''
  let responseClass = ''

  if (req.query.mc == '200') {
    responseMessage = 'پاسخ تیکت با موفقیت ارسال شد'
    responseClass = 'alert-success'
  } else if (req.query.mc == '200') {
    responseMessage = 'خطا در ارسال پاسخ تیکت. لطفا دوباره تلاش کنید!'
    responseClass = 'alert-danger'
  }

  res.render('tickets', {
    userID: req.userInfo.userID,
    firstName: userInfo ? userInfo.firstName : '',
    lastName: userInfo ? userInfo.lastName : '',
    job: historyInfo ? historyInfo.job : ' ',
    responseMessage: responseMessage,
    responseClass: responseClass,
    tickets: ticketsInfo
  })
})

router.post('/tickets', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  req.body.userID = req.userInfo.userID
  let updateStatus = await ticketsControllers.updateContactInDB(req.body)
  if (updateStatus) {
    let ticketInfo = await ticketsControllers.selectContactsByIDFromDB(req.body)
    let obj = {
      email: ticketInfo.sender,
      question: ticketInfo.message,
      answer: ticketInfo.response,
      userInfo: req.userInfo
    }
    emailUtil.sendVerificationEmail(obj)
    res.redirect('/users/tickets?mc=200')
    return
  }
  res.redirect('/users/tickets?mc=400')
})

// GET logout
router.get('/logout', async function(req, res, next) {
  res.clearCookie('pi_token')
  res.redirect('/users/login')
})

module.exports = router;
