const userContoller = require('../controllers/users.controller');
const authVerify = require('../middlewares/authVerify');


module.exports = (app , database) => {

    app.get('/users',[authVerify.verifyToken], (req, res) => {
        userContoller.getUser(database , res);
    });

    app.get('/user_roles', (req , res)=>{
        userContoller.getUser_role(database , res);
    })

    app.get('/user/cars/:id', (req, res)=>{
        userContoller.getUser_cars(database , req , res);
    })

    app.post('/user/add-car' ,[authVerify.verifyToken], (req , res)=>{
        userContoller.addCar_user(database ,req , res);
    })

}

