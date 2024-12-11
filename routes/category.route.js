const {Router} = require('express');

const router = Router();

const categoryController = require('../src/controllers/category.controller');
const categoryMiddleware = require('../src/middlewares/category.middleware');
const {upload} = require('../src/middlewares/category.middleware')
router.post('/create', upload.single('img'), categoryMiddleware.create, categoryController.createProduct);
router.get('/', categoryController.getAllProducts);
router.get('/:model', categoryController.getProductByModel);
router.get('/:id/:model', categoryMiddleware.findById, categoryController.getProductById);
router.post('/:id/:model', upload.single('img'), categoryMiddleware.update, categoryController.updateProductById);
router.delete('/:id/:model', categoryMiddleware.findById, categoryController.deleteProductById)

module.exports = router;
