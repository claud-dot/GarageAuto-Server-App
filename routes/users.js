const userContoller = require('../controllers/users.controller');
const authVerify = require('../middlewares/authVerify');


module.exports = (app , database) => {

    app.get('/users',[authVerify.verifyToken], (req, res) => {
        userContoller.getUser(database , res);
    });

    app.get('/user_roles', (req , res)=>{
        userContoller.getUser_role(database , res);
    })

}

