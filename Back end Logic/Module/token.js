
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    refreshToken:{
        type:String,
        required:true
    },
    ip:{
        type:String,
        required:true
    },
    userAgent:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    isValid:{
        type:Boolean,
        default:true
    }

})

module.exports = mongoose.model('Token',tokenSchema);

