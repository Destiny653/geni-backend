const Bath = require('../models/Bath')
const Valies = require('../models/Valies')
const Toy = require('../models/Toy')
const Underwear = require('../models/Underwear')
const Clothing = require('../models/Clothing')
const Order = require('../models/Order')
const Client = require('../models/Client')
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

const sendMail = async (email, status) => {
    try {
        // Step 3: Prepare email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verification Code',
            html: `
                <h1>Welcome to GENI~I Provision!</h1>
                <h3>Thank you for making a deal with us your orders will be handled appropriately.</h3>
                <h4>Your product is: <h1 style="color:green">${status}</h1></h4>
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
const createOrder = async (data) => {
    console.log("this data: ", data);
    
    try {
        // Calculate productTotal for each product
        data.products = data.products.map(product => ({
            ...product, productTotal: product.quantity * product.price
        }))
        // Calculate the total order price
        data.total = data.products.reduce((total, product) => total + product.productTotal, 70)
        console.log("total of data: ", data.total)
        // Create a new order
        const order = new Order(data)
        await order.save() 
        
        if (order) {
            // update the client by pushing order id
            const client =  await Client.findByIdAndUpdate({ _id: data.clientId }, { $push: { orders: order._id } }, { new: true }).exec();
            await sendMail(client.email, order.status)

            return {
                success: true,
                status: 201,
                message: 'Order created successfully',
                data: order
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error
        }
    }
}

const updateOrder = async (clientId, status) => {
    try {
        const data = await Order.findOneAndUpdate({ client: clientId }, { $set: { status: status } }, { new: true }).exec();
        const client = await Client.findOne({_id:clientId})
        await sendMail(client.email, status)
        if (data) {
            return {
                success: true,
                status: 200,
                message: 'Order updated successfully',
                data
            }
        } else {
            return {
                success: false,
                status: 404,
                message: 'Order not found',
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error
        }
    }
}

const getAllOrders = async () => {
    try {
        const data = await Order.find().exec();
        return {
            success: true,
            status: 200,
            message: 'Orders fetched successfully',
            data
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error
        }
    }
}

const deleteOrder = async (orderId) => {
    try {
        const data = await Order.findByIdAndDelete(orderId).exec();
        if (data) {
            return {
                success: true,
                status: 200,
                message: 'Order deleted successfully',
            }
        } else {
            return {
                success: false,
                status: 404,
                message: 'Order not found',
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: 'Internal server error: ' + error
        }
    }
}

module.exports = {
    createOrder,
    updateOrder,
    getAllOrders,
    deleteOrder,
 
}
