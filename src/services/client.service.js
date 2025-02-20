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
    return {
        success: true,
        status: 200,
        message: 'Email is valid.',
    }


    // const apiKey = process.env.API_KEY;  
    // const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=4ad138433227e7967feb4cbf761758f8825f69c1`;

    // try {
    //     const response = await axios.get(url); 
    //     const result = await response.data.data;  
    //     const data = {
    //         result
    //     }
    //     return {
    //         success: true,
    //         status: 200,
    //         message: 'Email is valid.',
    //         data
    //     }

    // } catch (error) {
    //     console.error('Error verifying email with neverbounce:', error.message);
    //     return {
    //         success: false,
    //         status: 500,
    //         message: 'Error verifying email: ' + error.message
    //     }
    // }
};

const sendMail = async (email, otp) => {
    try {
        // Step 3: Prepare email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "🔐 BabyBliss Verification Code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #007bff;">👶 Welcome to BabyBliss Provision!</h2>
                <p style="font-size: 16px; color: #555;">Use this code to continue your registration process.</p>
                <div style="background: #f9f9f9; padding: 15px; text-align: center; border-radius: 8px;">
                  <p style="font-size: 18px; font-weight: bold; margin: 0;">Your verification code:</p>
                  <h1 style="color: #007bff; margin: 5px 0;">${otp}</h1>
                </div>
                <p style="font-size: 14px; color: #555;">This code will expire in <strong>15 minutes</strong>.</p>
                <p style="font-size: 14px; color: red;"><strong>Do not share this code</strong> with anyone.</p>
                <p style="font-size: 14px; color: #777;">If you did not request this verification code, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #777;">Thank you for choosing BabyBliss Provision. 💙</p>
              </div>
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
    const characters = '123456789027615285397025637830365789';
    let code = ""
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

const generateExpired = (min) => {
    const date = new Date(Date.now() + (60 * 1000 * min));
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
        const otp = await Otp.findOneAndUpdate({ client: data.email }, { $set: { token } })
        console.log("OPTlog: ", otp, data.email)
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
            message: 'Incorrect email or password',
            data: {},
        }
    }
}

const generateOTP = async (email) => {
    try {
        // check if email exist
        const client = await verifyClient('client', email, 'Otp')
        if (client.success) {
            // OTP already expired generate new one
            const otpCode = await random(6);
            console.log("newOtpCode: ", otpCode);
            await Otp.findByIdAndUpdate({ _id: client.data._id }, { $set: { otp: otpCode, expired_at: generateExpired(15) } })
            return {
                success: true,
                status: 200,
                message: 'OTP sent successfully',
                data: otpCode,
            }
        }
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
            data: otpCode,
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
        const sendOTP = await sendMail(email, otp.data)
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
        }
        const mailOptions = {
            from: process.env.EMAIL,
            to: "fokundem653@gmail.com",
            subject: "🎉 New Client Registration - Babybliss Provision",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #007bff;">👶 Welcome to Babybliss Provision!</h2>
                <p style="font-size: 16px; color: #555;">A new client has registered on your web application.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0;">
                <p><strong>Name:</strong> ${_data.firstName} ${_data.lastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${_data.email}" style="color: #007bff;">${_data.email}</a></p>
                <p><strong>Phone:</strong> ${_data.phone}</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #777;">This is an automated notification from your website.</p>
              </div>
            `,
        };

        await transporter.sendMail(mailOptions);
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

const resetPassword = async (newPassword, email) => {
    try {
        const user = await Client.findOne({ email })
        console.log("User: ", user)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: 'User not found'
            }
        }
        const password = await hashPassword(newPassword)
        const update = await Client.findOneAndUpdate({ email: user.email }, { password }, { new: true })
        console.log("updtatedata", update)
        if (update) {
            return {
                success: true,
                status: 200,
                message: 'Password reset successfully',
                data: user.email
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
        const data1 = await Otp.findOne({ "otp": otp })
        if (!data1) {
            return {
                success: false,
                status: 401,
                message: 'Invalid OTP.'
            }
        }

        const data = await Otp.findOne({ "otp": otp, "expired_at": { $gt: new Date() } })
        console.log("otplog: ", data);
        if (data) {
            console.log("YES DATA AVAILABLE");
            const token = jwt.sign({ id: data._id }, 'secret_key', { expiresIn: '1h' });
            return {
                success: true,
                status: 200,
                message: 'Your email has been validated!.',
                data,
                token
            }
        } else {
            // await Otp.findOneAndDelete({ "otp": otp })
            return {
                success: false,
                status: 401,
                message: 'Your OTP has expired, resend email for a new one!'
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
            message: 'Incorrect email or password',
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
            await Client.findOneAndUpdate({ _id: _data.client }, { $push: { message: sent._id } })
            const mailOptions = {
                from: process.env.EMAIL,
                to: "fokundem653@gmail.com",
                subject: _data.title,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border-radius: 10px; background: #f9f9f9; border: 1px solid #e0e0e0;">
                    <h2 style="color: #333; text-align: center;">📩 New Message Received</h2>
                    
                    <p style="font-size: 16px; color: #555;">You have received a new message from:</p>
              
                    <div style="background: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                      <p><strong>📞 Phone:</strong> ${_data?.phone}</p>
                      <p><strong>✉️ Email:</strong> ${_data.email}</p>
                      <p><strong>💬 Message:</strong> ${_data.message}</p>
                    </div>
              
                    <p style="text-align: center; margin-top: 20px;">
                      <a href="mailto:${_data.email}" 
                        style="display: inline-block; padding: 10px 20px; color: #fff; background: #007bff; text-decoration: none; border-radius: 5px;">
                        Reply to Sender
                      </a>
                    </p>
              
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 14px; text-align: center; color: #888;">This is an automated notification from BabyBliss Provision.</p>
                  </div>
                `,
            };

            await transporter.sendMail(mailOptions);
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

const authorized = async (otp) => {
    const verified = verifyClient('otp', otp, 'Otp')
    if (verified) {
        return {
            success: true,
            status: 201
        }
    } else {
        return {
            success: false,
            status: 401
        }
    }
}

module.exports = {
    authorized,
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