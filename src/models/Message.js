const {Schema, model} = require('mongoose');

const messageSchema = new Schema({
    title:{
        type: String,
        enum:  ['Feedback', 'Question', 'Complaint', 'Suggestion'],
        default: 'Feedback',
        required: true
    },
    content:{
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