const nodeMailer = require("nodemailer");
const {SMPT_SERVICE , SMPT_MAIL , SMPT_PASSWORD, SMPT_HOST}  = require('../config/index');


const sendEmail = async (options) => {         //options wohi hen jo pora object bheja hai jisme email subject message hai

    const transporter = nodeMailer.createTransport({
        //service : "gmail",
        service : SMPT_SERVICE,
        auth : {
            user : SMPT_MAIL,   //isko .env men    simple mail transfer protocol
            pass : SMPT_PASSWORD,   //ye pass property hai
        host: SMPT_HOST,
        port: 465,
        //secure: true,
        //auth: {
        //    user: "fahadtariq786599@gmail.com.com",
        //    pass: "dhro jvmp iblt pide",
        },
    });

    const mailOptions = {
        from : SMPT_MAIL,   //ye yahi oper se mil jaye ga user Password se
        to : options.email,     //ye waha se mila jo userController men object men 3 cheezen di thi
        subject : options.subject,
        text : options.message,
    }

    await transporter.sendMail(mailOptions); //isse mail chali jaye gi        //transporter ko use karke send kare ge mail or usme mail option pass karne oper se agye
};

module.exports = sendEmail;


/*
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
 service: 'gmail',
 host: 'smtp.gmail.com',
 port: 465,
 secure: true,
 auth: {
    user: "fahadtariq786599@gmail.com.com",
    pass: "dhro jvmp iblt pide",
 },
});

const sendEmail = (email, token) => {
 const mailOptions = {
  from: 'fahadtariq786599@gmail.com',
  to: email,
  subject: 'Email verification',
  html:
'<p>Please click on the following link to verify your email address:</p>' +
'<a href="http://localhost:3000/verify/' +
token +
'">http://localhost:3000/verify/' +
token +
  '</a>',
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log('Error in sending email  ' + error);
    return true;
  } else {
   console.log('Email sent: ' + info.response);
   return false;
  }
 });
};

module.exports = sendEmail;

*/