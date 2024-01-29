const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('./sendMail');
const { isEmail } = require('validator');
const { google } = require('googleapis');
const { OAuth2 } = google.auth
const User = require('../models/UserModel');
// const fetch = require('node-fetch');

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID)

const userCtrl = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body

            if(!name) return res.status(400).json({ success: false, msg: 'Please enter a name!' })
            if(!email) return res.status(400).json({ success: false, msg: 'Please enter a email!' })
            if(!isEmail(email)) return res.status(400).json({ success: false, msg: 'Please enter a valid email!' })
            if(!password) return res.status(400).json({ success: false, msg: 'Please enter a password!' })

            const user = await User.findOne({ email })
            if(user) return res.status(400).json({ success: false, msg: 'This email is already exist!' })

            if(password.length < 6) return res.status(400).json({ success: false, msg: 'The password must be at least 6 caracters!' })
            
            const salt = 12
            const hashedPassword = await bcrypt.hash(password, salt)

            const newUser = {
                name, email, password: hashedPassword
            }

            const activationToken = createActivationToken(newUser)
            const url = `${process.env.CLIENT_URL}/user/activate/${activationToken}`

            sendMail('activate email', email, url, name)

            return res.status(200).json({ success: true, msg: 'Please check your email to complet your registration!' })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    activateEmail: async (req, res) => {
        try {
            const { activationToken } = req.body
            const user = jwt.verify(activationToken, process.env.ACTIVATION_TOKEN_SECRET)
            const { name, email, password } = user

            const check = await User.findOne({ email })
            if(check) return res.status(400).json({ msg: 'This email is already exist!' })

            const newUser = new User({
                name, email, password
            })
            await newUser.save()

            return res.json({ msg: 'You account has been activated successfully!'})
        } catch (err) {
            return res.status(500).json({ msg: err.message })            
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body
            if(!email) return res.status(400).json({ msg: 'Please enter an email!' })
            if(!isEmail(email)) return res.status(400).json({ msg: 'Please enter a valid email!' })
            if(!password) return res.status(400).json({ msg: 'Please enter an password!' })

            const user = await User.findOne({ email })
            if(!user) return res.status(400).json({ msg: 'This email does not exist!' })

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({ msg: 'Incorrect password!' })

            const refreshtoken = createRefreshToken({ id: user._id })
            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refreshtoken',
                maxAge: 1000*60*60*24*7 // 7days
            })

            return res.status(200).json({ success: true, data: refreshtoken })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getAccessToken: (req, res) => {
        try {
            const { refreshtoken } = req.cookies
                if(!refreshtoken) return res.status(400).json({ msg: 'Invalid authentication' })

            jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if(err) return res.status(400).json({ msg: 'Invalid authentication' })

                const accesstoken = createAccessToken({ id: user.id })
                return res.status(200).json({ success: true, data: accesstoken })
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body

            if(!email) return res.status(400).json({ msg: 'Please enter your email!' })
            if(!isEmail(email)) return res.status(400).json({ msg: 'Please enter a valid email!' })
            const user = await User.findOne({ email })
            if(!user) return res.status(400).json({ msg: 'This email does not exist!' })

            const accesstoken = createAccessToken({ id: user._id })
            const url = `${process.env.CLIENT_URL}/user/reset/${accesstoken}`
            
            sendMail('reset password', email, url, user.name)

            return res.json({ msg: 'Re-send the password. Please check your email!' })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { password, confirmPassword } = req.body

            if(!password) return res.status(400).json({ success: false, msg: 'Please enter a password!' })
            if(password.length < 6) return res.status(400).json({ success: false, msg: 'The password should be at least 6 caracters!' })
            if(password !== confirmPassword) return res.status(400).json({ success: false, msg: 'confirm password incorrect!' })
            
            const salt = 12
            const hashedPassword = await bcrypt.hash(password, salt)
            await User.findByIdAndUpdate({ _id: req.user.id }, {
                password: hashedPassword
            })

            return res.json({ success: true, msg: 'Your password is updated successfully!' })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    userInfo: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password')
            return res.status(200).json({ success: true, data: user })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    logout: (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/user/refreshtoken' })
            return res.json({ msg: 'Logged out successfully!' })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    googleLogin: async (req, res) => {
        try {
            const { tokenId } = req.body
            
            const verify = await client.verifyIdToken({
                idToken: tokenId,
                audience: process.env.MAILING_SERVICE_CLIENT_ID
            })

            const { email_verified, name, email, picture } = verify.payload

            if(!email_verified) return res.status(400).json({ msg: 'Email not found!' })

            const password = email + process.env.GOOGLE_SECRET
            const salt = 12
            const hashedPassword = await bcrypt.hash(password, salt)

            const user = await User.findOne({ email })
            if(user) {
                const isMatch = await bcrypt.compare(password, user.password)
                if(!isMatch) return res.status(400).json({ msg: 'Incorrect password!' })

                const refreshtoken = createRefreshToken({ id: user._id })
                res.cookie('refreshtoken', refreshtoken, {
                    httpOnly: true,
                    path: '/user/refreshtoken',
                    maxAge: 1000*60*60*24*7
                })

                return res.status(200).json({ msg: 'Login successfully!' })
            } else {
                const newUser = new User({
                    name, email, password: hashedPassword, picture
                })

                await newUser.save()

                const refreshtoken = createRefreshToken({ id: newUser._id })
                res.cookie('refreshtoken', refreshtoken, {
                    httpOnly: true,
                    path: '/user/refreshtoken',
                    maxAge: 1000*60*60*24*7
                })

                return res.status(200).json({ msg: 'Login successfully!' })
            }
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    // facebookLogin: async (req, res) => {
    //     try {
    //         const {  accessToken, userID } = req.body
    //         // https://developers.facebook.com/docs/graph-api/overview
    //         const URL = `https://graph.facebook.com/v4.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`

    //         const data = await fetch(URL).then(res => res.json()).then(res => { return res })
    //         const { name, email, picture } = data

    //         const password = email + process.env.FACEBOOK_SECRET
    //         const salt = 12
    //         const hashedPassword = await bcrypt.hash(password, salt)

    //         const user = await User.findOne({ email })
    //         if(user) {
    //             const isMatch = await bcrypt.compare(password, user.password)
    //             if(!isMatch) return res.status(400).json({ msg: 'Incorrect password!' })

    //             const refreshtoken = createRefreshToken({ id: user._id })
    //             res.cookie('refreshtoken', refreshtoken, {
    //                 httpOnly: true,
    //                 path: '/user/refreshtoken',
    //                 maxAge: 1000*60*60*24*7
    //             })

    //             return res.status(200).json({ msg: 'Login successfully!' })
    //         } else {
    //             const newUser = new User({
    //                 name, email, password: hashedPassword, picture: picture.data.url
    //             })
    //             await newUser.save()

    //             const refreshtoken = createRefreshToken({ id: newUser._id })
    //             res.cookie('refreshtoken', refreshtoken, {
    //                 httpOnly: true,
    //                 path: '/user/refreshtoken',
    //                 maxAge: 1000*60*60*24*7
    //             })

    //             return res.status(200).json({ msg: 'Login successfully!' })
    //         }
    //     } catch (err) {
    //         return res.status(500).json({ msg: err.message })
    //     }
    // }
}

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '15m' })
}

const createAccessToken = (id) => {
    return jwt.sign(id, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

const createRefreshToken = (id) => {
    return jwt.sign(id, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

module.exports = userCtrl