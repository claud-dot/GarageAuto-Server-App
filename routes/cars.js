const carContoller = require('../controllers/cars.controller');
const authVerify = require('../middlewares/authVerify');


module.exports = ( app , database)=>{

    app.get('/cars', [authVerify.verifyToken] , (req , res)=>{
        carContoller.getCars(database,res);
    });

    app.get('/car/:id_car' , [authVerify.verifyToken] , (req , res)=>{
        carContoller.getCar(database,req,res);
    });
}