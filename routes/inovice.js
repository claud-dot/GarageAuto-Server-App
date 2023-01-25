const authVerify = require('../middlewares/authVerify');
const inoviceController = require('../controllers/inovice.controller');


module.exports = ( app , database)=>{

    app.get('/inovice/repair/:id_repair',[authVerify.verifyToken], (req , res)=>{
        inoviceController.getInoviceRepair(database , req , res);
    });

} 