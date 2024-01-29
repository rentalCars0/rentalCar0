const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    car: {
        type: Object,
        required: true,
    },
    from: {
        type: Date,
        required: [true, 'Please enter The start date']
    },
    to: {
        type: Date,
        required: [true, 'Please enter The end date']
    },
    phone: {
        type: String,
        required: [true, 'Please enter your phone']
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
})

const Order = mongoose.model('Order', OrderSchema)
module.exports = Order