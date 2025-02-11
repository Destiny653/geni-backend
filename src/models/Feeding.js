const {Schema, model} = require('mongoose');

const feedingSchema = new Schema({
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
    reviewCount:{
        type: Number,
        default: 0
    },
    badge:{
        type: String,
        enum: ['new', 'sale', 'best-seller', '20% OFF'],
        default: 'new'
    },
    ageGroup:{
        type: String,
        enum: ['toddler', 'newborn', 'infant', 'prSchool', 'gradeshool' ]
    },
    subCategory:{
        type: String,
        enum: ['100% Contton', "Machine Washable", "Breathable"],
        required: true
    },
    stockStatus:{
        type: String,
        enum: ['In Stock', 'Out of Stock'], 
        required: true
    },
    model:{
        type: String,
        enum:['Clothing', 'Toy', 'Bath', 'Valies', 'Underwear', 'Diaper', 'Feeding'], 
        required: true
    } 
},{timestamps: true}) 

module.exports = model('Feeding', feedingSchema);