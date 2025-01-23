const {Schema, model} = require('mongoose');

const messageSchema = new Schema({
    title:{
        type: String,
        enum:  ['feedback', 'question', 'complaint', 'suggestion'],
        default: 'feedback',
        required: true
    },
    message:{
        type: String,
        required: true
    },
    client:{
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    }
},{timestamps: true})

module.exports = model('Message', messageSchema);