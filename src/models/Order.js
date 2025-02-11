const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                refPath: 'productModel',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            productTotal: {
                type: Number,
                default: function () {
                    return this.quantity * this.price;
                }
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        }, 
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
    }
}, { timestamps: true })

module.exports = model('Order', orderSchema);