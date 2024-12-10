const { json } = require('express')
const Otp = require('../models/Otp')
const clientService = require('../services/client.service')


const clientLogin = async(req, res)=>{
    const {_data, password} = req._data
    const data = await clientService.clientLogin(_data, password)
    res.status(data.status).json(data)
}
const registerClient = async(req, res)=>{
    const _data = req._data
    const data = await clientService.registerClient(_data)
    console.log(data);
    res.status(data.status).json(data) 
}

const forgotPassword = async (req, res) =>{  
    const otp = await clientService.generateOTP(req.user._id)
    const data = await clientService.sendMail(req.user.email, otp.data.otp)
    res.status(data.status).json(data)
}

const resetPassword = async (req, res)=>{
    const {password, otp} = req.body;
    const data = await clientService.resetPassword(password, otp)
    res.status(data.status).json(data)
}

const getClient = async(req, res)=>{
    const data = await clientService.getClient()
    res.status(data.status).json(data)
} 
const deleteClient = async(req, res)=>{
    const { id } = req.params;
    const data = await clientService.deleteClient(id)
    res.status(data.status).json(data)
}
const sendMessage = async(req, res)=>{
    const _data = req._data;
    const data = await clientService.sendMessage(_data)
    res.status(data.status).json(data)
}

const getMessages = async(req, res)=>{
    const data = await clientService.getMessages()
    res.status(data.status).json(data)
}

module.exports = {
    clientLogin,
    registerClient,
    getClient, 
    deleteClient,
    sendMessage, 
    getMessages,
    forgotPassword,
    resetPassword,
}