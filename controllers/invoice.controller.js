const ObjectId = require('mongodb').ObjectId;

function subTotal(results) {
    let val = 0;
    for (const result of results) {
        val+=result.montant;
    }
    return val;
}

function taxMontant(taux , subTotal){
    return (subTotal*taux)/100;
}

exports.getInvoiceRepair=(database , req, res)=>{

    database.collection('invoices').findOne({ repair_id : ObjectId(req.params.id_repair) } , (err, invoice)=>{
        if(err){
         res.status(500).send({ message : err });
         return;
        }
        if(invoice){
           const sub = subTotal(invoice.results_comment);
           const tax = taxMontant(10,sub);
           invoice.subTotal = sub;
           invoice.withTax = tax;
           invoice.totalAmount = (sub + tax);
        }
        database.collection('repair').findOne({ _id : ObjectId(req.params.id_repair) } , (err , repair)=>{
            database.collection('users').findOne({_id : ObjectId(repair.user_car.user_id) } , (err , user)=>{
                const dataSend = {
                    invoice : invoice,
                    user : user
                } 
                console.log(dataSend);
                res.status(200).send(dataSend);
            })
        });
    });
}