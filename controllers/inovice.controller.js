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

exports.getInoviceRepair=(database , req, res)=>{

    database.collection('inovices').findOne({ repair_id : ObjectId(req.params.id_repair) } , (err, inovice)=>{
       if(err){
         res.status(500).send({ message : err });
         return;
       }
       if(inovice){
           const sub = subTotal(inovice.results_comment);
           const tax = taxMontant(10,sub);
           inovice.subTotal = sub;
           inovice.withTax = tax;
           inovice.totalAmount = (sub + tax);
           console.log(inovice);
       }
       res.status(200).send(inovice);
    });
}