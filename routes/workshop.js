const mailsender = require('../middlewares/mailsender');
const authVerify = require('../middlewares/authVerify');

module.exports = (app ,database) =>{
    app.post('/workshop/sendmail',authVerify.verifyToken , (req, res)=>{
        mailsender.sendMail(database ,req.body , res);
    });
}