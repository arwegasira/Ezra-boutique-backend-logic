
const SendVerficationEmail = require('./sendVerificationEmail');
const {attachCookies,isTokenValid} = require('./jwt');
const createPayload = require('./createpayload')
const SendpasswordResetEmail = require('./sendpasswordresetemail');
const createHash = require('./createhash');

module.exports ={
    SendVerficationEmail,
    isTokenValid,
    attachCookies,
    createPayload,
    SendpasswordResetEmail,
    createHash
}