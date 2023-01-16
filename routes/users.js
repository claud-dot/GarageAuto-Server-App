const userContoller = require('../controllers/users.controller');
const authVerify = require('../middlewares/authVerify');


module.exports = (app , database) => {

    app.get('/users',authVerify.verifyToken, (req, res) => {
        userContoller.getUser(database , res);
    });

}

