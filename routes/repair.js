const authVerify = require('../middlewares/authVerify');
const repairController = require('../controllers/repair.controller');

module.exports = ( app , database)=>{

    app.post('/car/repair', [authVerify.verifyToken] , (req , res)=>{
        repairController.addReparation(database , req , res);
    });

    app.get('/car/user/repair/:data' , [authVerify.verifyToken] , (req , res)=>{
        const dataParse = JSON.parse(req.params.data);
        const data = {
            id : dataParse.id,
            pageNumber : Number.parseInt(dataParse.page),
            nbBypage : Number.parseInt(dataParse.nbBypage)
        }
        repairController.getRepairUser(database , data , res);
    })
    
    app.get('/car/user/repair/story/:data', [authVerify.verifyToken] , (req , res)=>{
        repairController.getRepairCarStory(database , req , res);
    })
}