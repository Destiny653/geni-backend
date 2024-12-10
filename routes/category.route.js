const {Router} = require('express');

const router = Router();

const categoryController = require('../src/controllers/category.controller');
const categoryMiddleware = require('../src/middlewares/category.middleware');

router.post('/create', categoryMiddleware.upload.single("picture"), categoryMiddleware.create, categoryController.createProduct);
router.get('/', categoryController.getAllProducts);
router.get('/get/:model', categoryController.getProductByModel);
router.get('/:id/:model', categoryMiddleware.findById, categoryController.getProductById);
router.put('/update/:id', categoryMiddleware.update, categoryController.updateProductById);
router.delete('/:id/:model', categoryMiddleware.findById, categoryController.deleteProductById)

module.exports = router;
