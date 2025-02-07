const {Schema, model} = require('mongoose');

const valiesSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    img:{
        type: String,
        required: true
    },
    rate:{
        type: Number,
        default: 0
    },
    model:{
        type: String,
        enum:['Clothing', 'Toy', 'Bath', 'Valies', 'Underwear', 'Diaper'], 
        required: true
    }
},{timestamps: true}) 

module.exports = model('Valies', valiesSchema);