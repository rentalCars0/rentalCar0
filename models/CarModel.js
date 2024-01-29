const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    main_image: {
        type: Object,
        required: true
    },
    images: {
        type: Array,
        default: [],
        required: true
    },
    comments: {
        type: Array,
        default: [],
    },
    marque: {
        type: String
    },
    carburant: {
        type: String
    },
    matricule: {
        type: String
    },
    n_place: {
        type: String
    },
    available_at: {
        type: Date
    },
    available: {
        type: Boolean,
        default: true
    },
    reserved_from: {
        type: Date,
    },
    reserved_to: {
        type: Date,
    },
}, {
    timestamps: true
})

const Car = mongoose.model('Car', CarSchema)
module.exports = Car