 async function createOrder(req, res, next) {
    const {products } = req.body
    req._data = { 
        products
    } 
    next();
}

async function updateOrder(req, res, next) {
    const {clientId, status} = req.body
    req._data = {
        clientId,
        status,
    }
    next();
}

async function deleteOrder(req, res, next) {
    const { orderId } = req.params
    req._data = {
        orderId,
    }
    next();
}

module.exports = { 
    createOrder,
    updateOrder,
    deleteOrder,
};