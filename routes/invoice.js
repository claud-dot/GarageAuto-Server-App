const authVerify = require('../middlewares/authVerify');
const invoiceController = require('../controllers/invoice.controller');


module.exports = ( app , database)=>{

    app.get('/invoice/repair/:id_repair',[authVerify.verifyToken], (req , res)=>{
        invoiceController.getInvoiceRepair(database , req , res);
    });

    app.put('/invoice/pay',[authVerify.verifyToken] , (req , res)=>{
        invoiceController.payInvoice(database , req , res);
    });

    app.put('/invoice/pay/valid',[authVerify.verifyToken] , (req , res)=>{
        invoiceController.validInvoice(database , req , res);
    });

    app.get('/invoice/turnover/:unit_duration',[authVerify.verifyToken], (req , res)=>{
        invoiceController.getTurnover(database , req , res);
    });

    app.post('/invoice/send',(req,res)=>{
        invoiceController.sendInvoice(req,res);
    });

    app.post('/invoice/getPDF',(req,res)=>{
        invoiceController.sendInvoicePdf(req,res);
    })

} 