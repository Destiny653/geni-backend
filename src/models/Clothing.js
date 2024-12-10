const {Schema, model} = require('mongoose');

const clothingSchema = new Schema({
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
    model:{
        type: String,
        enum:['Clothing', 'Toy', 'Bath', 'Valies', 'Underwear'], 
        required: true
    },
    rate:{
        type: Number,
        default: 0
    }
},{timestamps: true}) 

module.exports = model('Clothing', clothingSchema);