const Bath = require('../models/Bath')
const Valies = require('../models/Valies')
const Toy = require('../models/Toy')
const Underwear = require('../models/Underwear')
const Clothing = require('../models/Clothing')
const Diaper = require('../models/Diaper')

const verifyProduct = async (key, value, model) => {
    console.log("model is: ", model);
    model = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase()
    const modelMapping = {
        'Clothing': Clothing,
        'Bath': Bath,
        'Valies': Valies,
        'Toy': Toy,
        'Underwear': Underwear,
        'Diaper': Diaper
    };

    try {
        const product = await modelMapping[model].findOne({ [key]: value });
        if (product) {
            return {
                success: true,
                status: 200,
                message: 'Product found successfully',
                data: product,
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'Product not found, Please provide valid credentials',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error,
            data: {},
        }
    }
}

const createProduct = async (_data, model) => {
    console.log("model is: ", model);
    const modelMapping = {
        'Clothing': Clothing,
        'Bath': Bath,
        'Valies': Valies,
        'Toy': Toy,
        'Underwear': Underwear
    };
    try {
        const product = new modelMapping[model](_data);
        await product.save();
        return {
            success: true,
            status: 201,
            message: 'Product created successfully',
            data: product,
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error,
            data: {},
        }
    }
}

const getOneProductModel = async (model) => {
    try {
        let products;

        // Use a map or dynamic model fetching to avoid a large switch statement if more models are added in the future
        const modelMapping = {
            'Clothing': Clothing,
            'Bath': Bath,
            'Valies': Valies,
            'Toy': Toy,
            'Underwear': Underwear,
            'Diaper': Diaper
        };

        if (!modelMapping[model]) {
            return {
                success: false,
                status: 400, // Bad Request
                message: 'Invalid product model',
                data: {},
            };
        }

        products = await modelMapping[model].find({});
        console.log("products: ", products);

        if (products.length > 0) {
            return {
                success: true,
                status: 200,
                message: 'Products found successfully',
                data: products,
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'No products found',
                data: [],
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error,
            data: {},
        }
    }
}

const getAllProductModel = async () => {
    try {
        const models = [Clothing, Bath, Valies, Toy, Underwear, Diaper];  // Array of all models
        let data = [];

        for (let model of models) {
            const products = await model.find({});
            data = [...data, ...products];  // Combine all products from different models
        }
        if (data.length > 0) {
            return {
                success: true,
                status: 200,
                message: 'Products found successfully',
                data: data
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'No products found',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error,
            data: {},
        }
    }

}

const updateProduct = async (id, updatedData, model) => {
    model = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase()
    const modelMapping = {
        'Clothing': Clothing,
        'Bath': Bath,
        'Valies': Valies,
        'Toy': Toy,
        'Underwear': Underwear,
        'Diaper': Diaper
    };
    try {
        const product = await modelMapping[model].findByIdAndUpdate(id, updatedData, { new: true });
        if (product) {
            return {
                success: true,
                status: 200,
                message: 'Product updated successfully',
                data: product,
            }
        } else {
            return {
                success: false,
                status: 404,
                message: 'Product not found, Please provide valid credentials',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error,
            data: {},
        }
    }
}

const getProductById = async (id, model) => {
    console.log("model is byId: ", model);
    model = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase()
    const modelMapping = {
        'Clothing': Clothing,
        'Bath': Bath,
        'Valies': Valies,
        'Toy': Toy,
        'Underwear': Underwear,
        'Diaper': Diaper
    };
    try {
        const product = await modelMapping[model].findById(id);
        if (product) {
            return {
                success: true,
                status: 200,
                message: 'Product found successfully',
                data: product,
            }
        } else {
            return {
                success: false,
                status: 404,
                message: 'Product not found, Please provide valid credentials',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error,
            data: {},
        }
    }
}

const deleteProduct = async (id, model) => {
    model = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase()
    const modelMapping = {
        'Clothing': Clothing,
        'Bath': Bath,
        'Valies': Valies,
        'Toy': Toy,
        'Underwear': Underwear,
        'Diaper': Diaper
    };
    try {
        await modelMapping[model].findByIdAndDelete(id);
        return {
            success: true,
            status: 200,
            message: 'Product deleted successfully',
            data: {},
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error,
            data: {},
        }
    }
}

module.exports = {
    verifyProduct,
    createProduct,
    getOneProductModel,
    getAllProductModel,
    updateProduct,
    getProductById,
    deleteProduct,

}
