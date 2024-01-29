require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connection = require('./database/connection');
var fileupload = require("express-fileupload");
const path = require('path')
const app = express()

connection()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(cookieParser())
app.use(fileupload({
    useTempFiles: true
}))

app.get('/', (req, res) => {
    return res.status(200).json({ page: 'home' })
})

app.use('/api/car', require('./routes/CarRoutes'))
app.use('/api/order', require('./routes/OrderRoutes'))
app.use('/api', require('./routes/Cloudinary'))
app.use('/api/user', require('./routes/UserRouters'))

app.use(express.static(path.join(__dirname, "./client/build")))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))
})

connection().then(() => {
    app.listen(process.env.PORT, () => console.log(`Server is listening on port: http://localhost:${process.env.PORT}`))
})

// app.listen(process.env.PORT, () => console.log(`Server is listening on port: http://localhost:${process.env.PORT}`))
