const Order = require("../models/OrderModel")
const sendMail = require("./sendMail")

const OrderCtrl = {
    getOrders: async (req, res) => {
        try {
            const orders = await Order.find()
            return res.status(200).json({ success: true, data: orders })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
    createOrder: async (req, res) => {
        try {
            const { name, last_name, email, car, from, to, phone } = req.body
            const order = new Order({
                name, last_name, email, car: car, from, to, phone
            })
            await order.save()
            sendMail('new order', process.env.ADMIN_EMAIL, '', '')

            return res.status(200).json({ success: true, data: order })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    }, 
    deleteOrder: async (req, res) => {
        try {
            const { id } = req.params
            await Order.findByIdAndDelete({ _id: id })
            
            return res.status(200).json({ success: true, data: 'Order deleted successfuly!!' })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    }, 
    verifyOrder: async (req, res) => {
        try {
            const { verified } = req.body
            const { id } = req.params
            let order = await Order.findByIdAndUpdate({ _id: id }, {
                verified
            });
            sendMail('order confirmed', order.email, '', '')
            
            return res.status(200).json({ success: true, data: 'Order Verified successfuly!!' })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
}

module.exports = OrderCtrl