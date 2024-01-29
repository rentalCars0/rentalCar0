const CarCtrl = require('../controllers/CarCtrl')
const adminAuth = require('../middleware/adminAuth')
const auth = require('../middleware/auth')
const router = require('express').Router()

router.get('/', CarCtrl.getCars)
router.post('/', auth, adminAuth, CarCtrl.createCar)
router.put('/:id', auth, adminAuth, CarCtrl.updateCar)
router.delete('/:id', auth, adminAuth, CarCtrl.deleteCar)
router.put('/comment/:id', auth, CarCtrl.addComment)
router.put('/comment/remove/:id', auth, adminAuth, CarCtrl.removeComment)
router.patch('/:id', auth, adminAuth, CarCtrl.updateReservation)


module.exports = router