const authVerify = require('../middlewares/authVerify');
const repairController = require('../controllers/repair.controller');

module.exports = ( app , database)=>{

    app.post('/car/repair', [authVerify.verifyToken] , (req , res)=>{
        repairController.addReparation(database , req , res);
    });

    app.get('/cars/repairRequest/list',repairController.listRequest);
    app.post('/cars/addRepair',repairController.createReparation);
}