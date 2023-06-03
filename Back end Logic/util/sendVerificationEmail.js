
const sendMail = require('./sendMail');

const SendVerficationEmail = async({userEmail, subject,origin,verficationToken,userName})=>{
    // need to set up this route on front end
    let verificationLink = `${origin}/user/verify-account?user=${userEmail}&token=${verficationToken}`;
    let message = `<h4>Hello ${userName},</h4><p>Please click on the following link to verify your account: <a href="${verificationLink}">Verify account</a></p>`
    return sendMail({to:userEmail, subject:subject,html:message})
}

module.exports = SendVerficationEmail 