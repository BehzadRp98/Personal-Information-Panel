var express = require('express');
var router = express.Router();


// Utils functions
var hashingUtil = require('../utils/hashing');

// Controllers functions
var usersControllers = require('../controllers/users');

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
    // res.render('login', {
    //   success_msg: '',
    //   error_msg: 'پرکردن فیلدها اجباری است'
    // })
    res.sendStatus(400)
    return
  }

  loginObj.password = await hashingUtil.getPasswordHash(loginObj.password)

  let loginStatus = await usersControllers.selectUserFromDB(loginObj)

  if (loginStatus) {
    setTimeout(function() {
      res.redirect('/users/dashboard')
    }, 1000)
    // res.sendStatus(200)
    return
  }

  res.sendStatus(400)
})

// GET dashboard page content
router.get('/dashboard', function(req, res, next) {
  res.render('dashboard')
})
module.exports = router;
