const {Schema, model} = require('mongoose');

const otpSchema = new Schema({
    client:{
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    otp: {
        type: String,
        required: true,
        unique: true
    },
    expired_at:{
        type: Date,
        required: true,
        default: Date.now() + 300000 // 5 minutes
    }
},{timestamps: true})

module.exports = model('Otp', otpSchema);