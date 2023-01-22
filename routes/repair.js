const authVerify = require('../middlewares/authVerify');
const repairController = require('../controllers/repair.controller');

module.exports = ( app , database)=>{

    app.post('/car/repair', [authVerify.verifyToken] , (req , res)=>{
        repairController.addReparation(database , req , res);
    });

    app.get('/car/user/repair/:id/:page/:nbBypage' , [authVerify.verifyToken] , (req , res)=>{
        const data = {
            id : req.params.id,
            pageNumber : Number.parseInt(req.params.page),
            nbBypage : Number.parseInt(req.params.nbBypage)
        }
        repairController.getRepairUser(database , data , res);
    })
}