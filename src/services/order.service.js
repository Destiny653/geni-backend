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
            subject: "🛍️ Order Confirmation - GENI~I Provision",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #007bff;">🎉 Welcome to Babybliss Provision!</h2>
                <p style="font-size: 16px; color: #555;">Thank you for doing business with us. Your order is being processed and will be handled immediately.</p>
                <div style="background: #f9f9f9; padding: 15px; text-align: center; border-radius: 8px;">
                  <p style="font-size: 18px; font-weight: bold; margin: 0;">Order Status:</p>
                  <h1 style="color: green; margin: 5px 0;">${status}</h1>
                </div>
                <p style="font-size: 16px; color: #555;">If you have any questions, feel free to reach out:</p>
                <p><a href="https://babybliss-seven.vercel.app/contact" style="color: #007bff; font-weight: bold;">📩 Contact Us</a></p>
                <hr style="border: none; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #777;">Thank you for choosing GENI~I Provision. We appreciate your trust in us! 💙</p>
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
const createOrder = async (data) => {
    
    try {
        // Calculate productTotal for each product
        data.products = data.products.map(product => ({
            ...product, productTotal: product.quantity * product.price, product
        }))
        // Calculate the total order price
        data.total = data.products.reduce((total, product) => total + product.productTotal, 0).toFixed(2) 
        // Create a new order
        const order = new Order(data)
        console.log("ORder: ", order)
        await order.save() 
        
        if (order) {
            // const verifyIf
            // update the client by pushing order id
            const client =  await Client.findByIdAndUpdate({ _id: data.client }, { $push: { orders: order._id } }, { new: true }).exec();
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
            message: 'Internal server error: ' + error.message
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
