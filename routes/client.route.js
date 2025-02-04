const {Router} = require('express');
const router = Router();

const clientController = require('../src/controllers/client.controller');
const clientMiddleware = require('../src/middlewares/client.middleware');

router.post('/email', clientMiddleware.validateEmailZeroBounce, clientController.mailVerification)
router.post('/otp', clientMiddleware.authenticateOTP)
router.get('/authorized/:otp', clientController.authorizedClient)
router.get('/token/:token', clientMiddleware.token)

router.post('/register', clientMiddleware.register, clientController.registerClient);

router.post('/login', clientMiddleware.login, clientController.clientLogin)

router.post('/forgot-password', clientMiddleware.verifyEmail, clientController.forgotPassword)

router.post('/reset-password', clientMiddleware.verifyPassword, clientController.resetPassword) 

router.get('/', clientController.getClient)

router.delete('/delete/:id', clientController.deleteClient)

router.post('/message', clientMiddleware.message, clientController.sendMessage)

router.get('/messages', clientController.getMessages)

module.exports = router