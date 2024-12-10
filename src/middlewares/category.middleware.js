const multer = require('multer');
const path = require('path')
const categoryService = require('../services/category.service')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const {title} = req.body;
        cb(null,  title + path.extname(file.originalname));
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 // 1MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG images are allowed.'));
        }
    }
});
async function create(req, res, next) {
    const { title, description, price, rate,  model } = req.body
   const img = req.file.filename
    if (!title) {
        return res.status(401).json({ success: false, message: 'Title is required' })
    }
    if (!description) {
        return res.status(401).json({ success: false, message: 'Description is required' })
    }
    if (!price) {
        return res.status(401).json({ success: false, message: 'Price is required' })
    }
    if (!rate) {
        return res.status(401).json({ success: false, message: 'Rate is required' })
    }
    if (!img) {
        return res.status(401).json({ success: false, message: 'Image is required' })
    }
    if (!model) {
        return res.status(401).json({ success: false, message: 'Model is required.' })
    }
    req._data = {
        title,
        description, 
        price,
        rate,
        img,
        model,
    }
    next()
}

async function update(req, res, next) {
    const { title, description, price, rate, img, model } = req.body
    const { id } = req.params
    if (!title) {
        return res.status(401).json({ success: false, message: 'Title is required' })
    }
    if (!description) {
        return res.status(401).json({ success: false, message: 'Description is required' })
    } 
    if (!price) {
        return res.status(401).json({ success: false, message: 'Price is required' })
    }
    if (!rate) {
        return res.status(401).json({ success: false, message: 'Rate is required' })
    }
    if (!img) {
        return res.status(401).json({ success: false, message: 'Image is required' })
    }
    if (!model) {
        return res.status(401).json({ success: false, message: 'Model is required.' })
    }
    req._data = {
        id,
        title,
        description, 
        price,
        rate,
        img,
        model,
    }
    next();
}

async function findById(req, res, next) {
    let { id, model } = req.params;
    if (!model) {
        return res.status(401).json({ success: false, message: 'Model is required.' })
    }
    if (!id) {
        return res.status(401).json({ success: false, message: 'ID is required' })
    }
    const verifyId = await categoryService.verifyProduct("_id", id, model)
    if (!verifyId.success) {
        return res.status(verifyId.status).json({ success: false, message: verifyId.message })
    }
    // capitalize first letter
    model = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase()
    req._data = { id, model }
    next();
}

module.exports = {
    create,
    update,
    findById,
    upload,
}