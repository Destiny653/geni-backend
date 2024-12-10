const clientService = require('../services/client.service')

async function validateEmailZeroBounce(req, res, next) {
    const { email } = req.body

    // Step 2: Perform real-time email validation
    const isValidEmail = await clientService.validateEmail(email);
    console.log('isValidEmail', isValidEmail);
    if (!isValidEmail.success) {
        return  res.status(isValidEmail.status).json(isValidEmail);
    }

    next()
}
async function register(req, res, next) {
    const { firstName, lastName, email, password, confirmPassword, phone, role } = req.body
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
    if (!role) {
        return res.status(400).json({ message: "Role is required" })
    }

    req._data = {
        firstName,
        lastName,
        email,
        password,
        phone,
        role
    };
    next();
}
async function login(req, res, next) {
    const { email, password } = req.body
    if (!email) {
        return res.status(400).json({ message: 'Email is required' })
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' })
    }
    const verifyEmail = await clientService.verifyClient("email", email)
    if (!verifyEmail) {
        return res.status(verifyEmail.status).json({ message: verifyEmail.message })
    }
    const _data = verifyEmail.data
    const verifyPassword = await clientService.verifyPassword(password, _data)
    if (!verifyPassword) {
        return res.status(verifyPassword.status).json({ message: verifyPassword.message })
    }
    console.log('email, password: ', email, password, verifyPassword);
    console.log("Email data: ", _data);

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
    const { password, confirmPassword, otp } = req.body
    if (!otp) {
        return res.status(400).json({
            error: true,
            message: 'Code is required to change password'
        });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({
            error: true,
            message: 'Passwords do not match'
        });
    }
    next();
}
async function message(req, res, next) {
    const { title, content } = req.body
    const { id } = req.query
    if (!content) {
        return res.status(400).json({ message: 'Content is required' })
    }
    if (!title) {
        return res.status(400).json({ message: 'Title is required' })
    }
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' })
    }
    const verify = await clientService.verifyClient("_id", id)
    if (!verify) {
        return res.status(verify.status).json({ message: verify.message })
    }

    console.log("logs: ", verify);

    req._data = {
        title,
        content,
        client: id
    };
    next();
}

module.exports = {
    login,
    register,
    message,
    verifyEmail,
    verifyPassword,
    validateEmailZeroBounce,
}