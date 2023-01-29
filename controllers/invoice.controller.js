const ObjectId = require('mongodb').ObjectId;
const utils = require('../utils');
const Repair = require("../models/repair");
const Invoice=require("../models/invoices")
const fs = require('fs');
const Pdfmake = require('pdfmake');
const path = require('path');
const FileSaver=require('file-saver');
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
    console.log("id_repair:"+req.params.id_repair);
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
exports.createReparation=(req,res)=>{
    const newReparation=new Repair(req.body);
    console.log(newReparation);
    newReparation.save()
        .then(repair=>res.json(repair))
        .catch(err=>res.status(400).json(err));
}
exports.sendInvoice=(req,res)=>{
    const new_invoice=new Invoice(req.body);
    console.log(new_invoice);
    new_invoice.save()
        .then(new_invoice=>res.json(new_invoice))
        .catch(err=>res.status(400).json(err));
}

exports.sendInvoicePdf=(req,res)=>{
    const new_invoice=new Invoice(req.body);
    let fonts = {
        Roboto: {
            normal:  path.join(__dirname, 'fonts/Roboto-Regular.ttf'),
            bold:  path.join(__dirname, 'fonts/Roboto-Medium.ttf'),
            italics:  path.join(__dirname, 'fonts/Roboto-Italic.ttf'),
            bolditalics:  path.join(__dirname, 'fonts/Roboto-MediumItalic.ttf')
        }
    };

    let pdfmake = new Pdfmake(fonts);

    let dd = {
        content: [
            {
                columns:[
                    {
                        text: 'Email:mandaRatovo44@gmail.com'
                    },
                    {
                        text: 'Date:29/01/2023\nstatus:payé\nsldks'
                    }
                ],
                columnGap: 250,
            },
            {
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    margin: [0, 50, 0, 0],
                    headerRows: 1,
                    widths: [ 20, 'auto', 100, '*',100 ],

                    body: [
                        [ '#','Description', 'Quantité', 'Prix unitaire(AR)', 'Prix total(AR)',]
                    ]
                },
            },{
                columns:[
                    {text:""},
                    {text:"Total: 10000Ar",lineHeight:1.5},

                ],
                columnGap:300
            }
        ]

    }
    for(let i=0;i<new_invoice.results_comment.length;i++){
        let temp=[
            {text:i+1,bold:true},
            new_invoice.results_comment[i].description,
            new_invoice.results_comment[i].qt,
            new_invoice.results_comment[i].unit_price,
            new_invoice.results_comment[i].montant
        ]
        dd.content[1].table.body.push(temp);
    }
    let pdfDoc = pdfmake.createPdfKitDocument(dd, {});
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=test.pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
}