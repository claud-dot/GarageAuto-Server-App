const authVerify = require('../middlewares/authVerify');
const invoiceController = require('../controllers/invoice.controller');


module.exports = ( app , database)=>{

    app.get('/invoice/repair/:id_repair',[authVerify.verifyToken], (req , res)=>{
        invoiceController.getInvoiceRepair(database , req , res);
    });

} 