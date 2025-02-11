const orderService = require('../services/order.service')
const clientService = require('../services/client.service')
const createOrder = async(req, res)=>{
    const products = req.body
    const checkClient = await  clientService.verifyClient('email', products.client, 'Client')
    
    if(!checkClient.success){
        return res.status(401).json({message: 'Client not found please register first', success:false})
    }
    products.client = checkClient.data._id
    console.log("checking: ",checkClient);
    const data = await orderService.createOrder(products)
    res.status(data.status).json(data)
}

const getOrders = async(req, res)=>{
    const data = await orderService.getAllOrders()
    res.status(data.status).json(data)
 
}

const updateOrderById = async(req, res)=>{
    const _data = req._data
    const data = await orderService.updateOrder(_data.id, _data)
    res.status(data.status).json(data)
}

const deleteOrderById = async(req, res)=>{
    const { id } = req.params;
    const data = await orderService.deleteOrder(id)
    res.status(data.status).json(data)
 
}

module.exports = {
    createOrder,
    getOrders,
    updateOrderById,
    deleteOrderById
 
}
