const {Schema, model} = require('mongoose');

const bathSchema = new Schema({
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
        enum:['Clothing', 'Toy', 'Bath', 'Valies', 'Underwear'], 
        required: true
    }
},{timestamps: true}) 

module.exports = model('Bath', bathSchema);