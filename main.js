require  ('dotenv').config()
const express = require('express');
const {connect} = require('mongoose');
const cors = require('cors')

connect(process.env.MONGO_URI)
.then((connection)=>{
    const app = express()
    app.use(cors())
    app.use(express.json())

    // routes
    const clientRoute = require('./routes/client.route'); 
    const orderRoute = require('./routes/order.route');
    const categoryRoute = require('./routes/category.route');

    app.use('/api/client', clientRoute); 
    app.use('/api/order', orderRoute);
    app.use('/api/category', categoryRoute);

    
    app.use((req, res, next)=>{
        return res.status(404).json({
            status: 'NOT FOUND',
            status_code: 404,
            message: 'The requested resource was not found',
            data:{
                protocol: req.protocol,
                method: req.method.toUpperCase(),
                url: req.originalUrl,
                path: req.path,
                query: req.query,
                ip: req.ip, 
                host: req.hostname,  
                port: req.port,
                timestamp: new Date()
            }
        })
    })
 
    app.use((error, req, res, next)=>{
        return res.status(500).json({
            status: 'ERROR',
            status_code: error.status || 500,
            message: error.message,
            data:{
                protocol: req.protocol,
                method: req.method.toUpperCase(),
                error: error.stack,
                url: req.originalUrl,
                path: req.path,
                query: req.query,  
                ip: req.ip,
                host:req.hostname, 
                port: req.port,
                timestamp: new Date()
            }
        })
    });

    const PORT = process.env.PORT || 3000; 
    app.listen(PORT, ()=>{
        console.log('App running on: '+PORT)
    })
})
.catch(error=>{
    console.log('MongoDB Error: '+error);
    
})