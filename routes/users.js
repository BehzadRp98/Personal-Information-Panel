var express = require('express');
var router = express.Router();


// Utils functions
var hashingUtil = require('../utils/hashing');

// Controllers functions
var usersControllers = require('../controllers/users');
var profileControllers = require('../controllers/profile');
var historyControllers = require('../controllers/history');

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
  res.render('login')
  // res.render('login', {
  //   success_msg: '',
  //   error_msg: ''
  // })
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

  if (loginStatus) {
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
  let profileInfo = await profileControllers.selectProfileFromDB(req.userInfo.userID)
  res.render('dashboard', {
    firstName: profileInfo.user.firstName,
    lastName: profileInfo.user.lastName,
    phoneNumber: profileInfo.phoneNumber,
    birthdayDate: profileInfo.birthdayDate,
    email: profileInfo.user.email,
    biography: profileInfo.biography,
    photoAddress: profileInfo.photoAddress,
    btnStatus: profileInfo.birthdayDate.length > 0 ||
              profileInfo.phoneNumber.length > 0 ||
              profileInfo.biography.length > 0 ? true : false
  })
})

// POST dashboard page content
router.post('/dashboard', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let profileObj = req.body
  let insertStatus = false
  profileObj.userID = req.userInfo.userID
  if (req.body.btnStatus) {
    insertStatus = await profileControllers.updateProfileInDB(profileObj)
    insertStatus = await usersControllers.updateUserInDB(profileObj)
    if (insertStatus) {
      let token = await authorizationMiddleware.generateJWT(profileObj)
      console.log(token)
      res.cookie('pi_token', token)
    }
  } else {
    insertStatus = await profileControllers.insertProfileToDB(profileObj)
  }
  if (insertStatus) {
    console.log('Ok')
  } else {
    console.log('Nok')
  }
  res.redirect('/users/dashboard')
})

// GET history page content
router.get('/history', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  let historyInfo = await historyControllers.selectHistoryFromDB(req.userInfo.userID)
  res.render('history', {
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
    ability: historyInfo ? historyInfo.ability : '',
    myRange: historyInfo ? historyInfo.myRange : '0',
    btnStatus: historyInfo == null ? false : true
  })
})

// POST history page content
router.post('/history', authorizationMiddleware.verifyJWT, async function(req, res, next) {
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
  res.render('blogs')
})

// GET tickets page content
router.get('/tickets', authorizationMiddleware.verifyJWT, async function(req, res, next) {
  res.render('tickets')
})

// GET logout
router.get('/logout', async function(req, res, next) {
  res.clearCookie('pi_token')
  res.redirect('/users/login')
})

module.exports = router;
