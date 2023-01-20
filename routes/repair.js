const authVerify = require('../middlewares/authVerify');
const repairController = require('../controllers/repair.controller');

module.exports = ( app , database)=>{

    app.post('/car/repair', [authVerify.verifyToken] , (req , res)=>{
        console.log(req.body);
        repairController.addReparation(database , req , res);
    });
}