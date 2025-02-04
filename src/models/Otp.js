const { Schema, model } = require('mongoose');

const otpSchema = new Schema({
    client: {
        type: String,
        ref: 'Client',
        unique: true,
        required: true
    },
    otp: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: false
    },
    expired_at: {
        type: Date,
        required: true,
        default: Date.now() + 300000 // 5 minutes
    }
}, { timestamps: true })

module.exports = model('Otp', otpSchema);