const ObjectId = require('mongodb').ObjectId;
const utils = require('../utils');

function subTotal(results) {
    let val = 0;
    for (const result of results) {
        val+=result.montant;
    }
    return val;
}

function taxMontant(taux , subTotal){
    if(subTotal == 0) return 0;
    return (subTotal*taux)/100;
}
function setPropetyInvoice(invoice){
    const sub = subTotal(invoice.results_comment);
    const tax = taxMontant(10,sub);
    invoice.subTotal = sub;
    invoice.withTax = tax;
    invoice.totalAmount = (sub + tax);
}

exports.getInvoiceRepair=(database , req, res)=>{

    database.collection('invoices').findOne({ repair_id : ObjectId(req.params.id_repair) } , (err, invoice)=>{
        if(err){
         res.status(500).send({ message : err });
         return;
        }
        
        setPropetyInvoice(invoice);
        database.collection('repair').findOne({ _id : ObjectId(req.params.id_repair) } , (err , repair)=>{
            database.collection('users').findOne({_id : ObjectId(repair.user_car.user_id) } , (err , user)=>{
                const dataSend = {
                    invoice : invoice,
                    user : user
                } 
                res.status(200).send(dataSend);
            })
        });
    });
}

exports.payInvoice = (database , req , res)=>{
    database.collection('invoices').findOneAndUpdate(
        { _id : ObjectId(req.body._id) }, 
        { $set : { status : 1 } } , 
        {} , (err , invoice)=>{
            if(err){
                res.status(500).send({ message : err });
                return;
            }
            invoice.value.status=1;
            setPropetyInvoice(invoice.value);
            database.collection('repair').findOneAndUpdate(
                { _id : ObjectId(invoice.value.repair_id) },
                { $set : { status : 1 , update_at : new Date() } },
                {}, (err , repair)=>{
                    if(err){
                        res.status(500).send({ message : err });
                        return;
                    }
                    
                    const dataSend = { 
                        message : "Invoice payed , successfully ! " , 
                        data : { 
                            invoice : invoice.value , 
                            repair : repair.value
                        }
                    }
                    res.status(200).send(dataSend);
                }
            )
    });

}

exports.validInvoice = (database , req , res)=>{
    database.collection('invoices').findOneAndUpdate(
        { _id : ObjectId(req.body._id) }, 
        { $set : { status : 1  , update_at : new Date()} } , 
        {} , (err , invoice)=>{
            if(err){
                res.status(500).send({ message : err });
                return;
            }
            invoice.value.status=2;
            setPropetyInvoice(invoice.value);
            database.collection('repair').findOneAndUpdate(
                { _id : ObjectId(invoice.value.repair_id) },
                { $set : { status : 2 , update_at : new Date() , repair_at : new Date()} },
                {}, (err , repair)=>{
                    if(err){
                        res.status(500).send({ message : err });
                        return;
                    }
                    
                    const dataSend = { 
                        message : "Invoice payed , successfully !" , 
                        data : { 
                            invoice : invoice.value , 
                            repair : repair.value
                        }
                    }
                    res.status(200).send(dataSend);
                }
            )
    });

}

exports.getTurnover = (database , req , res)=>{
    console.log(req.params.unit_duration);
    const pipeline = [
        { $match : { status : { $gte : 2 } } },
        {
            "$unwind": "$results_comment" //pour acceder a une array dans mongoDb
        },
        {
            $group : {
                _id: utils.groupUnitDuration(req.params.unit_duration),
                totalAmount: { $sum: { $multiply: [ "$results_comment.unit_price", "$results_comment.qt" ] } },
                count: { $sum: 1 }
             }
        }
    ]
   
    database.collection('invoices').aggregate(pipeline).toArray((err , data)=>{
        if(err){
            console.log(err);
            res.status(500).send({ message : err });
            return;
        }
        const dataSend = {
            dataBase : data,
            dataStat :  utils.getDataTurnover(req.params.unit_duration , data)
        }
        res.status(200).send(dataSend);
        return dataSend;
    });
}