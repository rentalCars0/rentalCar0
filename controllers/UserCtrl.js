const User = require("../models/UserModel")
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Order = require("../models/OrderModel");

const UserCtrl = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body
            
            if(name.length < 3) return res.status(400).json({ msg: 'The name must be at least 3 characters!'}) 
            if(!validator.isEmail(email)) return res.status(400).json({ msg: 'Please enter a valid email!'}) 
            if(password.length < 6) return res.status(400).json({ msg: 'Please enter a password at least 6 characters!'}) 
            
            const user = await User.findOne({ email })
            if(user) return res.status(400).json({ msg: 'This email is already token. Please choose another one!'})
            
            const salt = 10
            const hashedPassword = await bcrypt.hash(password, salt)
            const newUser = new User({
                name, email, password: hashedPassword
            })

            await newUser.save()
            const accessToken = createAccessToken({ id: newUser._id })
            const refreshtoken = createRefreshToken({ id: newUser._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/api/user/refreshtoken'
            })

            return res.json({ accessToken })
            
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body

            if(!validator.isEmail(email)) return res.status(400).json({ msg: 'Please enter a valid email!'}) 
            const user = await User.findOne({ email })
            if(!user) return res.status(400).json({ msg: 'Email not found!!' })
            if(password.length < 6) return res.status(400).json({ msg: 'Please enter a password at least 6 characters!'}) 
            
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({ msg: 'Incorrect password!!' })

            const accesstoken = createAccessToken({ id: user._id })
            const refreshtoken = createRefreshToken({ id: user._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/api/user/refreshtoken'
            })

            return res.status(200).json({ accesstoken })
            
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    refreshtoken: async (req, res) => {
        try {
            const token = req.cookies.refreshtoken
            if(!token) return res.status(400).json({ msg: 'Invalid Authentication!' })
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if(err) return res.status(400).json({ msg: 'Invalid Authentication!'})

                const accesstoken = createAccessToken({ id: user.id })
                return res.status(200).json({ accesstoken })
            })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/user/refreshtoken' })
            res.status(200).json('Logout successfult!')
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    userInfo: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password')
            return res.json({ user })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    addtocart: async (req, res) => {
        try {
            const user = req.user
            const { cart } = req.body
            if(!user) return res.status(400).json({ msg: 'Please login!'})
            await User.findByIdAndUpdate({ _id: req.user.id }, {
                cart: cart
            })

            return res.status(200).json({ msg: 'updated successfuly!'})
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    history: async (req, res) => {
        try {
            const history = await Order.find({ user_id: req.user.id })

            return res.status(200).json({ history })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

const createAccessToken = (id) => {
    return jwt.sign(id, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

const createRefreshToken = (id) => {
    return jwt.sign(id, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

module.exports = UserCtrl