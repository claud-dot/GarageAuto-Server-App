const carContoller = require('../controllers/cars.controller');
const authVerify = require('../middlewares/authVerify');


module.exports = ( app , database)=>{

    app.get('/cars', (req , res)=>{
        carContoller.getCars(database,res);
    })

}