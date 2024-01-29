const OrderCtrl = require('../controllers/OrderCtrl')
const adminAuth = require('../middleware/adminAuth')
const auth = require('../middleware/auth')

const router = require('express').Router()

router.get('/', OrderCtrl.getOrders)
router.post('/', auth, OrderCtrl.createOrder)
router.put('/verify/:id', auth, adminAuth, OrderCtrl.verifyOrder)
router.delete('/:id', auth, adminAuth, OrderCtrl.deleteOrder)

module.exports = router