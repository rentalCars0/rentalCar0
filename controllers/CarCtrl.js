const Car = require("../models/CarModel")

const CarCtrl = {
    getCars: async (req, res) => {
        try {
            const cars = await Car.find()
            return res.status(200).json({ success: true, data: cars })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
    createCar: async (req, res) => {
        try {
            const { name, price, description, images, marque, carburant, matricule, n_place, main_image } = req.body
            const car = new Car({
                name, price, description, images, marque, carburant, matricule, n_place, main_image
            })
            await car.save()

            return res.status(200).json({ success: true, data: car })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
    addComment: async (req, res) => {
        try {
            const { id } = req.params
            const { user, comment } = req.body
            const currentCar = await Car.findById({ _id: id })
            const car = await Car.findByIdAndUpdate({ _id: id }, {
                comments: [...currentCar.comments, { id: (new Date().getTime()).toString(), name: user.name, email: user.email, comment: comment }]
            })

            return res.status(200).json({ success: true, data: car })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
    removeComment: async (req, res) => {
        try {
            const { id } = req.params
            const { comment_id } = req.body
            const currentCar = await Car.findById({ _id: id })
            let comments = currentCar.comments.filter(comment => comment.id !== comment_id)
            
            let car = await Car.findByIdAndUpdate({ _id: id }, {
                comments: comments
            })

            return res.status(200).json({ success: true, data: car })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
    updateCar: async (req, res) => {
        try {
            const { id } = req.params
            const { name, price, description, images, marque, carburant, matricule, n_place, main_image } = req.body
            const car = await Car.findByIdAndUpdate({ _id: id }, {
                name, price, description, images, marque, carburant, matricule, n_place, main_image
            })

            return res.status(200).json({ success: true, data: car })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
    updateReservation: async (req, res) => {
        try {
            const { id } = req.params
            const { reserved_from, reserved_to } = req.body
            const car = await Car.findByIdAndUpdate({ _id: id }, {
                reserved_from: reserved_from, reserved_to: reserved_to
            })

            return res.status(200).json({ success: true, data: 'Reservation validated successfuly!' })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
    deleteCar: async (req, res) => {
        try {
            const { id } = req.params
            await Car.findByIdAndDelete({ _id: id })
            return res.status(200).json({ success: true, data: 'Car deleted successfuly!' })
        } catch (err) {
            return res.status(500).json({ success: false, msg: err.message })
        }
    },
}

module.exports = CarCtrl