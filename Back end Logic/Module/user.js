
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName:{
        type:String,
        require:[true,'First Name is required'],
        maxLength:30,
        
    },
    lastName:{
        type:String,
        require:[true,'Last Name is required'],
        maxLengtht:30
    },
    email:{
        type:String,
        //email should match the regex pattern
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'Please provide a valid email address.'],
        unique:true
    },
    password:{
        type:String,
        require:true,
        //password should be at least 8 char long, at least one uppercase   , at least one special char
        //match:[/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,'Invalid password']
    },
    role:{
        type:String,
        enum:['admin', 'user'],
        default:'user'
    },
    verficationToken:{
        type:String
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verficationDate:{
        type:Date
    },
    passwordResetToken:{
        type:String
    },
    passwordResetTokenExpiration:{
        type:Date
    }
},
{ timestamps: true },
)

//use a pre-save middleware to hash password
userSchema.pre('save', async function(){
    //this.modifiedPaths() // return an array of modified properties
    //this.isModified(property) return true of false in property was modified or not
    if(this.isModified('password')){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    }
 
})
//use a model fx to generate jwt 
userSchema.methods.generateJWT =  function(){
   return  jwt.sign({userId: this._id,email: this.email,name:this.lastName,role:this.role},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRATION}
        )
}
userSchema.methods.comparePassword = async function(plainPassword,hashPassword){
    return bcrypt.compare(plainPassword,hashPassword)
}
module.exports = mongoose.model('User',userSchema);
