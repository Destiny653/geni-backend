const Message = require('../models/Message');
const Client = require('../models/Client');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const axios = require('axios');
const validator = require('validator');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

const validateEmail = async (email) => {

    // Step 1: Validate email format
    if (!validator.isEmail(email)) {
        return {
            success: false,
            status: 400,
            message: 'Invalid email format. Please provide a valid email address.',
        };
    }

    const apiKey = process.env.API_KEY; // Store your API key in .env
    const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=4ad138433227e7967feb4cbf761758f8825f69c1`;

    try {
        const response = await axios.get(url);
        // console.log(`Email: ${email}, Status: ${response.data}`);
        const result = await response.data.data; // Contains the email verification results
        const data = {
            result
        }
        return {
            success: true,
            status: 200,
            message: 'Email is valid.',
            data
        }

    } catch (error) {
        console.error('Error verifying email with neverbounce:', error.message);
        return {
            success: false,
            status: 500,
            message: 'Error verifying email: ' + error.message
        }
    }
};

const sendMail = async (email, otp) => {
    try {
        // Step 3: Prepare email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Geni-i Verification Code',
            html: `
                <h1>Welcome to GENI~I Provision!</h1>
                <h3>Use this code to continue your registration process.</h3>
                <h4>Your verification code is: <h1 style="color:green">${otp}</h1></h4>
                <p>This code will expire in 15 minutes.</p>
                <p>Please do not share this code with anyone else.</p>
                <p>If you did not request this verification code, please ignore this email.</p>
                <p>Thank you for using GENI~I Provision.</p>
                <a href="https://geni-dashboard.vercel.app/dashboard/login">
                <button style="background-color:blue; border-radius:4px; padding: 3px 4px">Click to continue</button>
                </a>
            `,
        };

        // Step 4: Send the email
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            status: 200,
            message: 'Verification code sent to your email',
            info: info.response,
        };
    } catch (error) {
        console.error('Error sending mail:', error.message);

        // Step 5: Handle specific errors
        if (error.responseCode === 550 || error.message.includes('Invalid recipient')) {
            return {
                success: false,
                status: 400,
                message: 'Invalid email address. Please provide a registered email.',
            };
        }

        return {
            success: false,
            status: 500,
            message: 'Failed to send verification code. Please try again later.',
        };
    }
};

// const validateEmail = async (email) => {
//     const apiKey = 'your-api-key';
//     const url = `https://api.zerobounce.net/v2/validate?email=${email}&apikey=${apiKey}`;
//     try {
//         const response = await axios.get(url);
//         return response.data.status === 'valid';
//     } catch (error) {
//         console.error('Validation error:', error.message);
//         return false;
//     }
// };

const random = async (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = ""
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

const generateExpired = (min) => {
    const date = new Date(new Date().getTime() + (60 * 1000 * min));
    return date
}

const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, 'secret_key');
        return decoded;
    } catch (error) {
        console.error(error);
        return false;
    }
}

const comparePasswords = async (value, hash) => {
    try {
        const compare = await bcrypt.compare(value, hash);
        if (compare) {
            return {
                success: true,
                status: 200,
                message: 'Credentials validated passwords match',
            }
        } else {
            return {
                success: false,
                status: 401,
                message: 'Passwords do not match',
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

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error(error);
        return false;
    }
}
const verifyClient = async (key, value, model) => {
    const models = {
        'Client': Client,
        'Otp': Otp
    }
    try {
        const client = await models[model].findOne({ [key]: value });
        if (client) {
            return {
                success: true,
                status: 200,
                message: 'Client found successfully',
                data: client,
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'Client not found, Please provide valid credentials',
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

const clientLogin = async (data, password) => {
    const compare = await comparePasswords(password, data.password)
    if (compare.success) {
        const token = jwt.sign({ id: data._id }, 'secret_key', { expiresIn: '1h' });
        return {
            success: true,
            status: 200,
            message: 'Login successful',
            token: token,
            data
        }
    } else {
        return {
            success: false,
            status: 401,
            message: 'Incorrect password',
            data: {},
        }
    }
}

const generateOTP = async (email) => {
    try {
        const otpCode = await random(6);
        console.log("otpCode: ", otpCode);

        const otp = new Otp({
            client: email,
            otp: otpCode,
            expired_at: generateExpired(15)  // 15 minutes expiry time 60 * 15 = 900 seconds
        });
        await otp.save();
        return {
            success: true,
            status: 200,
            message: 'OTP sent successfully',
            data: otp,
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

const authenticateEmail = async (email) => {
    const otp = await generateOTP(email)
    if (otp.success) {
        const sendOTP = await sendMail(email, otp.data.otp)
        console.log("Email sent: " + JSON.stringify(sendOTP));  
        return {
            success: true,
            status: 200,
            message: 'Check your email to get your verification code.', 
        }
    }
}

const registerClient = async (_data) => {
    try {
        const hashedPassword = await hashPassword(_data.password);
        const client = new Client({ ..._data, password: hashedPassword });
        const savedClient = await client.save();
        if (savedClient) {
            return {
                success: true,
                status: 201,
                message: 'Client registered successfully',
                data: savedClient,
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'Internal server error: Failed to save client',
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

const resetPassword = async (password, code) => {
    try {
        const userOTP = await Otp.findOne({ "otp": code, "expired_at": { $gt: new Date() } })
        console.log('userOTP is: ', userOTP);

        if (!userOTP) {
            return {
                success: false,
                status: 401,
                message: 'Your token might have expired, trying requesting another one.'
            }
        }
        const user = await Client.findById(userOTP.client)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: 'User not found'
            }
        }
        user.password = await hashPassword(password)
        await user.save()
        Otp.deleteOne({ _id: userOTP._id });
        return {
            success: true,
            status: 200,
            message: 'Password reset successfully',
            data: {
                email: user.email
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: 'Error resetting password' + error.message
        }
    }
}

const verifyOTP = async (otp) => {
    try {
        const data = await Otp.findOne({ "otp": otp, "expired_at": { $gt: new Date() } })
        console.log("otplog: ", data);
        if (data) {
            const token = jwt.sign({ id: data._id }, 'secret_key', { expiresIn: '1h' });
            return {
                success: true,
                status: 200,
                message: 'Your email is valid you may proceed to registration.',
                data,
                token 
            }
        } else {
            await Otp.findOneAndDelete({"otp":otp})
            return {
                success: false,
                status: 401,
                message: 'Your OTP has expired, resend email to a new one!'
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: 'Error verifying OTP ' + error.message
        }
    }
}
const verifyPassword = async (password, data) => {

    const compare = await comparePasswords(password, data.password)
    if (compare.success) {
        return {
            success: true,
            status: 200,
            message: 'Password verified successfully',
            data: compare,
        }
    } else {
        return {
            success: false,
            status: 401,
            message: 'Incorrect password',
            data: {},
        }
    }
}

const getClient = async () => {
    try {
        const clients = await Client.find().populate('message').populate('orders');
        if (clients) {
            return {
                success: true,
                status: 200,
                message: 'Clients fetched successfully',
                data: clients,
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'Internal server error: Failed to fetch clients',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error:' + error,
            data: {},
        }
    }
}
const deleteClient = async (id) => {
    try {
        const deletedClient = await Client.findByIdAndDelete(id);
        if (deletedClient) {
            return {
                success: true,
                status: 200,
                message: 'Client deleted successfully',
                data: deletedClient,
            }
        } else {
            return {
                success: false,
                status: 404,
                message: 'Client not found',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error:' + error,
            data: {},
        }
    }
}
const sendMessage = async (_data) => {
    try {
        const sent = new Message(_data)
        await sent.save();
        if (sent) {
            return {
                success: true,
                status: 201,
                message: 'Message sent successfully',
                data: sent,
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'Failed to save message',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error:' + error,
            data: {},
        }
    }
}

const getMessages = async () => {
    try {
        const messages = await Message.find().populate('client');
        if (messages) {
            return {
                success: true,
                status: 200,
                message: 'Messages fetched successfully',
                data: messages,
            }
        } else {
            return {
                success: false,
                status: 500,
                message: 'Internal server error: Failed to fetch messages',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error:' + error,
            data: {},
        }
    }
}

const deleteMessage = async (id) => {
    try {
        const deletedMessage = await Message.findByIdAndDelete(id);
        if (deletedMessage) {
            return {
                success: true,
                status: 200,
                message: 'Message deleted successfully',
                data: deletedMessage,
            }
        } else {
            return {
                success: false,
                status: 404,
                message: 'Message not found',
                data: {},
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            status: 500,
            message: 'Internal server error:' + error,
            data: {},
        }
    }
}

module.exports = {
    authenticateEmail,
    verifyClient,
    clientLogin,
    registerClient,
    validateEmail,
    verifyOTP,
    verifyPassword,
    getClient,
    deleteClient,
    sendMessage,
    getMessages,
    deleteMessage,
    verifyToken,
    generateOTP,
    sendMail,
    resetPassword,
    // emailVerifier
};