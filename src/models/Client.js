const {Schema, model} = require('mongoose');

const  clientSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true, 
        required: false,
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String, 
        default: 'client',
        enum: ['admin', 'client']
    },
    message: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }]
},{timestamps: true})

module.exports = model('Client',  clientSchema);