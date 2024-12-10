const categoryService = require('../services/category.service')
async function create(req, res, next) {
    const { title, description, price, rate, img, model } = req.body
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
}