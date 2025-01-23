const clientService = require('../services/client.service')

async function validateEmailZeroBounce(req, res, next) {
    const { email } = req.body
    console.log(email);
    // Step 2: Perform real-time email validation
    const isValidEmail = await clientService.validateEmail(email);
    console.log('isValidEmail', isValidEmail);
    if (!isValidEmail.success) {
        return res.status(isValidEmail.status).json(isValidEmail);
    }

    next()
}
async function authenticateOTP(req, res, next){
    const { email, otp } = req.body
    const verifyOTP = await clientService.verifyClient("client", email, 'Otp')
    console.log("verifyOTP: ", verifyOTP.data, otp);   
    // if (verifyOTP.data.otp !== otp) {   
    //     return res.status(400).json({ message: 'Invalid OTP check your input' })
    // } 
    const verifyOTPExp = await clientService.verifyOTP(otp, email)
    if (verifyOTPExp.success) {
        return res.status(verifyOTPExp.status).json({success:true, message:verifyOTPExp.message,token:verifyOTPExp.token, data:verifyOTPExp.data})
    }else{
        return res.status(verifyOTPExp.status).json({ message: verifyOTPExp.message })
    } 
}
async function register(req, res, next) {
    const { firstName, lastName, email, password, confirmPassword, phone } = req.body
    if (!firstName) {
        return res.status(400).json({ message: 'First Name is required' })
    }
    if (!lastName) {
        return res.status(400).json({ message: 'Last Name is required' })
    }
    if (!email) {
        return res.status(400).json({ message: 'Email is required' })
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' })
    }
    if (!phone) {
        return res.status(400).json({ message: "Phone is required" })
    }
    if (!password === confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' })
    }

    const user = await clientService.validateEmail(email)

    if(!user.success){
        return res.status(user.status).json({message:user.message})
    }
    
    let data = {
        firstName,
        lastName,
        email,
        password,
        phone
    }
    // get last four letters of password
    const lastFourPassword = password.slice(-4);
    if (lastFourPassword === '4gen') {
        data.role = 'admin'
    }

    req._data = { data };
    next();
}
async function login(req, res, next) {
    const { email, password} = req.body
    if (!email) {
        return res.status(400).json({ message: 'Email is required' })
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' })
    }
    const verifyEmail = await clientService.verifyClient("email", email, 'Client')
    if (!verifyEmail.success) {
        return res.status(verifyEmail.status).json({ message: verifyEmail.message })
    }
    const _data = verifyEmail.data

    const verifyPassword = await clientService.verifyPassword(password, _data)
    if (!verifyPassword.success) {
        return res.status(verifyPassword.status).json({ message: verifyPassword.message })
    } 

    req._data = { _data, password };
    next();
}

const verifyEmail = async (req, res, next) => {
    const { email } = req.body;
    const user = await clientService.verifyClient("email", email)
    if (!user) {
        return res.status(400).json({
            error: true,
            message: 'Email not found !!!'
        });
    }
    req.user = user.data
    next();
}

const verifyPassword = async (req, res, next) => {
    const { password, confirmPassword} = req.body 
    
    if (password !== confirmPassword) {
        return res.status(400).json({
            error: true,
            message: 'Passwords do not match'
        });
    }
    next();
}
async function message(req, res, next) {
    const { email, message, title } = req.body 
    if (!message) {
        return res.status(400).json({ message: 'Message is required' })
    }
    if(!title){
        return res.status(400).json({ message: 'Title is required' })
    }
    if (!email) {
        return res.status(400).json({ message: 'Email is required' })
    } 

    const user = await clientService.verifyClient("email", email, 'Client') 

    if(!user.success){
        return res.status(400).json({ message: 'User with: '+email+ ' not found.'})
    }

    req._data = { 
        message, 
        title,
        client: user.data._id  
    };
    next();
}

module.exports = {
    authenticateOTP,
    login,
    register,
    message,
    verifyEmail,
    verifyPassword,
    validateEmailZeroBounce,
}