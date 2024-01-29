const userCtrl = require('../controllers/UserController')
const router = require('express').Router()
const auth = require('../middleware/auth')
const authForReset = require('../middleware/authForReset')

router.post('/register', userCtrl.register)
router.post('/activate', userCtrl.activateEmail)
router.post('/login', userCtrl.login)
router.get('/refreshtoken', userCtrl.getAccessToken)
router.post('/forgot', userCtrl.forgotPassword)
router.post('/reset', authForReset, userCtrl.resetPassword)
router.get('/userinfo', auth, userCtrl.userInfo)
router.get('/logout', userCtrl.logout)

module.exports = router