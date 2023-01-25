const authVerify = require('../middlewares/authVerify');
const repairController = require('../controllers/repair.controller');

module.exports = ( app , database)=>{

    app.post('/car/repair', [authVerify.verifyToken] , (req , res)=>{
        repairController.addReparation(database , req , res);
    });

    app.get('/cars/repairRequest/list', [authVerify.verifyToken],repairController.listRequest);
    app.post('/cars/addRepair', [authVerify.verifyToken],repairController.createReparation);

    app.get('/car/user/repair/:data' , [authVerify.verifyToken] , (req , res)=>{
        repairController.getRepairUser(database , JSON.parse(req.params.data) , res);
    })
    
    app.get('/car/user/repair/story/:data', [authVerify.verifyToken] , (req , res)=>{
        repairController.getRepairCarStory(database , req , res);
    })
}