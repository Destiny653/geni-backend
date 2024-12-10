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
        enum: ['pending', 'processing', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true })

module.exports = model('Order', orderSchema);