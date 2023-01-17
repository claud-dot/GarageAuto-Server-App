 
require('dotenv').config();
const nodeMailer = require('nodemailer');
const utils = require('../utils');

let transporter = nodeMailer.createTransport(
    {
        service : process.env.MAIL_SERVICE,
        host : process.env.MAIL_HOST,
        secure : process.env.MAIL_SECURE ,
        port : process.env.MAIL_PORT,
        auth : {
            user : process.env.MAIL_USER,
            pass : process.env.MAIL_PASSWORD 
        }
    } 
);

let processMail = (usermail , req, res)=>{
    usermail.from = process.env.MAIL_USER;
    if(req.typemail=="html"){
        usermail.text = usermail.message;
    }else{
        usermail.html = '<h1>Hello world !</h1></br><p>'+usermail.message+'</p>';
    }

    transporter.sendMail(usermail , (err , mail)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        } 

        res.status(200).send({ message : "Mail sent successful ! " });
    })
}

exports.sendMail = (database , req , res) => {
    const usermail = {
        to : utils.tabToString(req.email),
        subject : req.subject,
        message : req.message
    }

    const pipeline = [
        {
            $match : {
                email : { $in : req.email}
            }
        },
        {
            $project : { email : 1 }
        },
        {
            $group : {
                _id : "$email" 
            },
        }
    ];

    database.collection('users').aggregate(pipeline).toArray((err , mails)=>{
        
        if(err){
            res.status(500).send({ message : err });
            return;
        }

        let mailInExist = utils.compareTwoElTab(req.email , mails);
        if(mailInExist.length!=0){
            res.status(404).send({ message : "Failed ! Email "+mailInExist.toString()+" does not exist" });
            return;
        }
        usermail.to = utils.tabToString(mails);
        processMail(usermail , req , res);
    });
}




