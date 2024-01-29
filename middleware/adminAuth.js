const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/UserModel");

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)

        if(user.role !== '1234') {
            return res.status(400).json({ msg: 'Page not allowed!'})
        }
        
        next()
    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
}

module.exports = adminAuth