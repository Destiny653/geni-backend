const {Router} = require('express');

const router = Router();
const orderController = require('../src/controllers/order.controller');
const orderMiddleware = require('../src/middlewares/order.middleware');

router.get('/', orderController.getOrders)

router.post('/', orderController.createOrder);

router.put('/', orderMiddleware.updateOrder, orderController.updateOrderById)

router.delete('/:id', orderMiddleware.deleteOrder, orderController.deleteOrderById)

module.exports = router;