
const sendMail = require('./sendMail');

const SendpasswordResetEmail = async({userEmail, subject,origin,resetToken,userName})=>{
    // need to set up this route on front end
    let verificationLink = `${origin}/user/reset-password?user=${userEmail}&token=${resetToken}`;
    let message = `<h4>Hello ${userName},</h4><p>Please click on the following link to reset password: <a href="${verificationLink}">Reset Password</a></p>`
    return sendMail({to:userEmail, subject:subject,html:message})
}

module.exports = SendpasswordResetEmail