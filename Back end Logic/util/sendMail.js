
const nodemailer = require("nodemailer");


const sendMail = async({to,subject,text,html})=>{

    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.ETHEREAL_USERNAME, // generated ethereal user
          pass: process.env.ETHEREAL_PASSWORD , // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      return transporter.sendMail({
        from: '"Abdou Rwegasira" <ac.rwegasira@gmail.com>', // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html // html body
      })

}

module.exports = sendMail;

