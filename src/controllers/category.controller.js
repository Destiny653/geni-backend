const categoryService = require('../services/category.service') 
const createProduct = async (req, res) => {
    const _data = req._data 
    const model = _data.model.charAt(0).toUpperCase() + _data.model.slice(1).toLowerCase()
    const data = await categoryService.createProduct(_data, model)
    res.status(data.status).json(data)
}

const getAllProducts = async (req, res) => {
    const data = await categoryService.getAllProductModel()
    res.status(data.status).json(data)

}

const getProductByModel = async (req, res) => {
    let { model } = req.params
    // capitalize first letter
    model = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase()
    const data = await categoryService.getOneProductModel(model)
    res.status(data.status).json(data)
}

const getProductById = async (req, res) => {
    const _data = req._data
    const model = _data.model.charAt(0).toUpperCase() + _data.model.slice(1).toLowerCase();
    const data = await categoryService.getProductById(_data.id, model)
    res.status(data.status).json(data)
}

const updateProductById = async (req, res) => {
    const _data = req._data
    const model = _data.model.charAt(0).toUpperCase() + _data.model.slice(1).toLowerCase();
    const data = await categoryService.updateProduct(_data.id, _data, model)
    res.status(data.status).json(data)
}

const deleteProductById = async (req, res) => {
    const _data = req._data
    const data = await categoryService.deleteProduct(_data.id, _data.model)
    res.status(data.status).json(data)

}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    getProductByModel,
}