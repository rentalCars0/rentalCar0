const router = require('express').Router()
const cloudinary = require('cloudinary');
const fs = require('fs');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET 
})

router.post('/upload', auth, adminAuth, async (req, res) => {
    try {
        const { files } = req.files

        if(!req.files || files.length === 0 || Object.keys(files).length === 0 || files === null)
            return res.status(400).json({ msg: "No file uploaded!" })

        var filesSize = 0
        if(files.length === undefined && Object.keys(files).length !== 0) {
            if(files.size > 1 * 1024 * 1024) {
                removeTempFile(files.tempFilePath)
                return res.status(400).json({ msg: 'File is too large!' })
            }
            
            if(files.mimetype !== 'image/png' && files.mimetype !== 'image/jpeg' && files.mimetype !== 'image/webp' && files.mimetype !== 'image/svg+xml') {
                removeTempFile(files.tempFilePath)
                return res.status(400).json({ msg: 'File type not supported!' })
            }

            cloudinary.v2.uploader.upload(files.tempFilePath, { folder: 'rent_cars'}, (err, result) => {
                removeTempFile(files.tempFilePath)
                if(err) {
                    return console.log(err.message);
                }

                return res.status(200).json({
                    public_id: result.public_id,
                    secure_url: result.secure_url
                })
            })
        }
        else {
            console.log('files: ', files)
            files.forEach(f => {
                filesSize += f.size
            });
    
            if(filesSize > 10 * 1024 * 1024)
                return res.status(400).json({ msg: "Files size is too big" })
    
            var matchedFiles = []
            matchedFiles.forEach(f => {
                tempfilesPaths.push(f.tempFilePath)
                // removeTempFile(f.tempFilePath)
            })
    
            files.forEach(f => {
                if(f.mimetype === 'image/png' || f.mimetype === 'image/jpeg' || f.mimetype === 'image/webp' || f.mimetype === 'image/svg+xml') {
                    matchedFiles.push(f)
                }
                // removeTempFile(f.tempFilePath)
            })
    
            var uploadedFiles = [] 
            const uploader = async (path) => await cloudinary.v2.uploader.upload(path, { folder: "rent_cars" });
    
            for (const file of matchedFiles) {
                const respons = await uploader(file.tempFilePath)
                uploadedFiles.push({
                    public_id: respons.public_id,
                    secure_url: respons.secure_url
                })
            }
    
            files.forEach(f => {
                removeTempFile(f.tempFilePath)
            })
    
            return res.json({ uploadedFiles: uploadedFiles })    
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: err.message })
    }
})

router.post('/destroy', auth, adminAuth, (req, res) => {
    try {
        const { public_id } = req.body

        if(!public_id) return res.status(400).json({ msg: "No file selected!" })

        cloudinary.v2.uploader.destroy(public_id, (err, result) => {
            if(err) throw err

            return res.status(200).json({ msg: "File deleted successfuly!" })
        })
        
    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
})

const removeTempFile = (path) => {
    fs.unlink(path, err => {
        if(err) {
            return console.log(err.message);
        }
    })
}


/*
router.post('/upload', auth, adminAuth, (req, res) => {
    try {
        if(!req.files) return res.status(400).json({ msg: 'No file uploaded!'})
        
        const file = req.files.file
        if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/webp') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({ msg: 'File type note supported!'})
        }

        if(file.size > 1024*1024*2) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({ msg: 'File size is too large!'})
        }

        cloudinary.v2.uploader.upload(file.tempFilePath, { folder: 'ecommerce_Shoes'}, (err, result) => {
            removeTmp(file.tempFilePath)
            if(err) throw err

            return res.status(200).json({
                public_id: result.public_id,
                secure_url: result.secure_url
            })
        })
        
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
})

router.post('/destory', auth, adminAuth, (req, res) => {
    try {
        const { public_id } = req.body
        if(!public_id) return res.status(400).json({ msg: 'no file selected!'})

        cloudinary.v2.uploader.destroy(public_id, (err, result) => {
            if(err) throw err

            return res.status(200).json({ msg: 'File deleted successfuly!'})
        })
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
})

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err
    })
}*/

module.exports = router