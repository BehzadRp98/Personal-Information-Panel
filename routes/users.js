var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var passwordValidator = require('password-validator');

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
    if (req.query.mc == 400) {
        res.render('register', {
            responseMessage: 'پرکردن فیلدها اجباری است',
            responseClass: 'alert-danger'
        })
        return
    } else if (req.query.mc == 401) {
        res.render('register', {
            responseMessage: 'پسوردهای وارد شده مغایرت دارند',
            responseClass: 'alert-danger'
        })
        return
    } else if (req.query.mc == 405) {
        res.render('register', {
            responseMessage: 'پسورد وارد شده باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک و عدد باشد',
            responseClass: 'alert-danger'
        })
        return
    } else if (req.query.mc == 500) {
        res.render('register', {
            responseMessage: 'خطا در برقراری ارتباط با سرور',
            responseClass: 'alert-danger'
        })
        return
    }
    res.render('register', {
        responseMessage: '',
        responseClass: ''
    })
});

// POST register page content
router.post('/register', async function(req, res, next) {
    let registerObj = req.body
    var schema = new passwordValidator();
    schema
        .is().min(8)
        .has().uppercase()
        .has().lowercase()
        .has().digits(1)
    if (registerObj.email.length == 0 || registerObj.firstName.length == 0 || registerObj.lastName.length == 0) {
        res.redirect('/users/register?mc=400');
        return
    } else if (!schema.validate(registerObj.password)) {
        res.redirect('/users/register?mc=405');
        return
    } else if (registerObj.password != registerObj.passwordConfirm) {
        res.redirect('/users/register?mc=401');
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

    res.redirect('/users/register?mc=500');
})

// GET login page content
router.get('/login', function(req, res, next) {
    if (req.query.mc == 400) {
        res.render('login', {
            responseMessage: 'پرکردن فیلدها اجباری است',
            responseClass: 'alert-danger'
        })
        return
    } else if (req.query.mc == 401) {
        res.render('login', {
            responseMessage: 'نام کاربری یا رمزعبور نادرست است',
            responseClass: 'alert-danger'
        })
        return
    }
    res.render('login', {
        responseMessage: '',
        responseClass: ''
    })
})

// POST login page content
router.post('/login', async function(req, res, next) {
    let loginObj = req.body
    if (loginObj.email.length == 0 || loginObj.password.length == 0) {
        console.log('پرکردن فیلدها اجباری است')
        res.redirect('/users/login?mc=400');
        return
    }

    loginObj.password = await hashingUtil.getPasswordHash(loginObj.password)

    let loginStatus = await usersControllers.selectUserFromDB(loginObj)

    if (loginStatus != null && loginStatus.password == loginObj.password) {
        let token = await authorizationMiddleware.generateJWT(loginStatus)
        console.log(token)
        res.cookie('pi_token', token)
        setTimeout(function() {
            res.redirect('/users/dashboard')
        }, 1000)
        return
    }

    res.redirect('/users/login?mc=401');
})

// GET dashboard page content
router.get('/dashboard', authorizationMiddleware.verifyJWT, async function(req, res, next) {
    let userInfo = await usersControllers.selectUserFromDB(req.userInfo)
    let profileInfo = await profileControllers.selectProfileFromDB(req.userInfo.userID)
    let historyInfo = await historyControllers.selectHistoryFromDB(req.userInfo.userID)

    res.render('dashboard', {
        userID: req.userInfo.userID,
        job: historyInfo && historyInfo.job.length > 0 ? historyInfo.job[historyInfo.job.length - 1].job : '',
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
            if (err) console.log('ERROR: ' + err);
        });
    } catch (err) {
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
        universities: historyInfo && historyInfo.university ? historyInfo.university : [],
        universitiesCount: historyInfo && historyInfo.university ? historyInfo.university.length : 0,
        // grade: historyInfo ? historyInfo.grade : '',
        // major: historyInfo ? historyInfo.major : '',
        // university: historyInfo ? historyInfo.university : '',
        // endYear: historyInfo ? historyInfo.endYear : '',
        // eduDescription: historyInfo ? historyInfo.eduDescription : '',

        // Perofessional History
        jobs: historyInfo && historyInfo.job ? historyInfo.job : [],
        jobsCount: historyInfo && historyInfo.job ? historyInfo.job.length : 0,
        job: historyInfo && historyInfo.job.length > 0 ? historyInfo.job[historyInfo.job.length - 1].job : '',
        // post: historyInfo ? historyInfo.post : '',
        // place: historyInfo ? historyInfo.place : '',
        // expYear: historyInfo ? historyInfo.expYear : '',
        // wDescription: historyInfo ? historyInfo.wDescription : '',

        // Abilities
        abilities: historyInfo && historyInfo.ability ? historyInfo.ability : [],
        abilitiesCount: historyInfo && historyInfo.ability ? historyInfo.ability.length : 0,
        btnStatus: historyInfo == null ? false : true,
    })
})

// POST history page content
router.post('/history', authorizationMiddleware.verifyJWT, async function(req, res, next) {
    let ability = []
    let universities = []
    let jobs = []

    for (let r in req.body) {
        if (String(r).includes('ability')) {
            let temp = String(r).replace('ability', 'myRange')
            console.log(req.body[temp])
            ability.push({
                name: req.body[r],
                myRange: req.body[temp]
            });
        } else if (String(r).includes('university')) {
            let grade = String(r).replace('university', 'grade')
            let major = String(r).replace('university', 'major')
            let endYear = String(r).replace('university', 'endYear')
            let eduDescription = String(r).replace('university', 'eduDescription')
            universities.push({
                university: req.body[r],
                grade: req.body[grade],
                major: req.body[major],
                endYear: req.body[endYear],
                eduDescription: req.body[eduDescription],

            });
        } else if (String(r).includes('job') && String(r) != "jobsCount") {
            let post = String(r).replace('job', 'post')
            let place = String(r).replace('job', 'place')
            let expYear = String(r).replace('job', 'expYear')
            let wDescription = String(r).replace('job', 'wDescription')
            jobs.push({
                job: req.body[r],
                post: req.body[post],
                place: req.body[place],
                expYear: req.body[expYear],
                wDescription: req.body[wDescription],
            });
        }
    }


    req.body.ability = ability
    req.body.universities = universities
    req.body.jobs = jobs

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
        job: historyInfo && historyInfo.job.length > 0 ? historyInfo.job[historyInfo.job.length - 1].job : '',
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
        job: historyInfo && historyInfo.job.length > 0 ? historyInfo.job[historyInfo.job.length - 1].job : '',
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