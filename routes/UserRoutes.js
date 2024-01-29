const router = require('express').Router()
const UserCtrl = require('../controllers/UserCtrl')
const auth = require('../middleware/auth')

router.post('/register', UserCtrl.register)
router.post('/login', UserCtrl.login)
router.get('/refreshtoken', UserCtrl.refreshtoken)
router.get('/logout', UserCtrl.logout)
router.get('/userinfo', auth, UserCtrl.userInfo)
router.get('/history', auth, UserCtrl.history)
router.patch('/addtocart', auth, UserCtrl.addtocart)

module.exports = router