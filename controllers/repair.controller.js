
const objectID = require('mongodb').ObjectId;
const Repair=require('../models/repair');
const utils = require('../utils');

function insertRepair (database  , car_user, req , res){
    const repair = {
        user_car : car_user,
        comment : req.body.comment,
        advancement : 0.0,
        status : 0,
        repair_at : new Date(),
        finish_at : new Date(),
        create_at : new Date(),
        update_at : new Date() 
    }

    //mi insere anle reparation
    database.collection('repair').insertOne(repair , (err , result)=>{
        if(err){
            res.status(500).send({ message: err });
            return;
        }

        if(result.insertedId){
            res.status(200).send({ message: "Car deposit successfully ! " });
        }
    });
}

function processCarUser(database , car_user , res, req){
    delete car_user._id;
    //find voiture user
    database.collection('user_cars').findOne(car_user , (err , car)=>{
        if(err){
            res.status(500).send({ message: err });
            return;
        }

        //Rah tss dia inserena
        if (!car) {
            car_user.create_at = new Date();
            car_user.update_at = new Date();
            car_user.repair_at = new Date();
            car_user.finish_at = "";
            
            database.collection('user_cars').insertOne(car_user , (err , result)=>{
                if(err){
                    res.status(500).send({ message: err });
                    return;
                }
    
                if(result.insertedId){
                    car_user = {_id : result.insertedId , ...car_user};
                    insertRepair(database , car_user , req , res);
                }
            })
        }else{
            checkRepairAuthorize(database , car , req, res);
        }
    })
}

function checkRepairAuthorize(database , car_user , req , res) {
    
    database.collection('repair').find({ "user_car._id" : car_user._id}).toArray((err , repairs)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        
        for (const repair of repairs) {
            if(repair.status!=3){
                res.status(400).send({ message : "Failed ! , car under repair" });
                return;
            }
        }
        insertRepair(database , car_user , req , res);
    })
}

exports.addReparation = (database  , req, res) =>{
    
    let car_user= {
        user_id : objectID(req.body.user_id),
        mark : req.body.mark,
        model : req.body.model,
        year_of_manufacture : req.body.year_of_manufacture
    }

    //verify if car exist !
    database.collection('cars').findOne( { mark : car_user.mark , models : car_user.model } ,(err, car)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }

        if(!car){
            res.status(404).send({ message : "Failed ! , car not exist" });
            return;
        }
        //Check if car is on repair and have status incomplete
        processCarUser(database , car_user , res , req);
    }) 
}


exports.getRepairUser= (database , data , res)=>{
   
    const pipeline = [
        { $match : utils.creatOjectMatchRepair(data)},
        { $lookup:
            {
              from: "user_cars",
              localField: "user_car._id",
              foreignField: "_id",
              as: "user_cars"
            } 
        },
        { $lookup:
            {
              from: "invoices",
              localField: "_id",
              foreignField: "repair_id",
              as: "invoice_repair"
            } 
        },
        { $sort : { update_at  : -1 } },
        { $facet : {
            metadata : [
                { $count : "total" },
                { $addFields : { page : data.page}}
            ],
            data : [
                { $skip : data.page > 0 ? ((data.page - 1 )* data.nbBypage) : 0 },
                { $limit : data.nbBypage }
            ]
        } }
    ]
    
    database.collection('repair').aggregate(pipeline).toArray((err , repairs) => {
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        var car_repairs = repairs[0];
        for (const repair of car_repairs.data) {
            repair.user_cars = repair.user_cars[0];
            repair.isFactured = true;
            repair.invoice_repair = repair.invoice_repair[0];
        }
        res.status(200).send( car_repairs ); 
    });
}

exports.getRepairCarStory = (database , req , res)=>{
    const data = JSON.parse(req.params.data);
    const dataMatch = data.status=="null" ? 
    { 
        "user_car._id" : objectID(data.car_id) , 
        "user_car.user_id" : objectID(data.user_id) 
        }: 
        {
            "user_car._id" : objectID(data.car_id) , 
            "user_car.user_id" : objectID(data.user_id) , 
            status : parseInt(data.status) 
        } ;
    const pipeline = [
        { $match : dataMatch },
        { $sort : { update_at  : -1 } },
        { $facet : {
            metadata : [
                { $count : "total" },
                { $addFields : { page : data.page}}
            ],
            data : [
                { $skip : data.page > 0 ? ((data.page - 1 )* data.nbBypage) : 0 },
                { $limit : data.nbBypage }
            ]
        } }
    ]
    
    database.collection('repair').aggregate(pipeline).toArray((err, repairs)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        const listId = [];
        for(let repair of repairs[0].data){
            listId.push(repair._id);
        }

        database.collection("invoices").find({ repair_id : { $in : listId}}).toArray((err , invoices)=>{
            if(err){
                res.status(500).send({ message : err });
                return;
            }
            let invoiceSend = [];
            let incr = 0;
            for (const id_repair of listId) {
                const index = invoices.findIndex((invoice)=> invoice.repair_id.equals(id_repair));
                if(index==-1){
                    invoiceSend.push({});
                }else{
                    invoiceSend.push(invoices[index]);
                }
                incr++;
            }

            var car_repairs ={
                repairs : repairs[0],
                invoices : invoiceSend
            } 
            res.status(200).send( car_repairs );
        })
    })
}

//Responsable Financier
exports.getPayementRepair = (database , data , res)=>{

    const pipeline = [
        { $match :  { status : { $gte : 1 } }},
        {
            $lookup: {
              from: "user_cars",
              localField: "user_car._id",
              foreignField: "_id",
              as: "user_cars"
            } 
        },
        {
            $lookup: {
              from: "invoices",
              localField: "_id",
              foreignField: "repair_id",
              as: "invoices"
            } 
        },
        { $sort : { status : 1 , update_at  : -1 } },
        { $facet : {
            metadata : [
                { $count : "total" },
                { $addFields : { page : data.page}}
            ],
            data : [
                { $skip : data.page > 0 ? ((data.page - 1 )* data.nbBypage) : 0 },
                { $limit : data.nbBypage }
            ]
        } }
    ];

    database.collection('repair').aggregate(pipeline).toArray((err , repairs)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        var car_repairs = repairs.length<=0 ? [] : repairs[0];
        console.log(car_repairs.data[1]);
        for (const repair of car_repairs.data) {
            repair.user_cars = repair.user_cars[0];
            repair.invoice_repair = repair.invoices[0];
        }
        res.status(200).send( car_repairs );
    });
    
}

exports.getRepairStat = (database , data, res)=>{
    const dataFind = {};
    let index= 0;
    for (const key in data) {
       if(data[key].trim()!=""){
            dataFind["user_car."+key] = data[key];
            index++;
       }
    }
    dataFind["status"] = { $gte : 2 };
    (index<=0 ? database.collection('repair').find(dataFind).limit(10) : database.collection('repair').find(dataFind))
        .toArray((err , repairs)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        const listIdRepair = [];
        for (const repair of repairs) {
            listIdRepair.push(repair._id);
        }
        database.collection('invoices').aggregate([
            { $match : { repair_id : { $in  : listIdRepair  }} }
        ]).toArray((err , invoices)=>{
            if(err){
                console.log(err);
                res.status(500).send({ message: err });
                return;
            }
            utils.getExistInvoice(repairs , invoices);
            const dataSend = {
                repair : repairs,
                invoice : invoices,
                durations : utils.durationRepair(invoices , res)
            }
            res.status(200).send(dataSend);
        });
    })
}

//afficher la liste des demandes de reparations
exports.listRequest=(req,res)=>{
    Repair.find()
    .then(repairs=>{
        console.log(repairs);
        res.json(repairs);
    })
    .catch(err=>err.status(400).json(err));
};

exports.createReparation=(req,res)=>{
    const newReparation=new Repair(req.body);
    console.log(newReparation);
    newReparation.save()
        .then(repair=>res.json(repair))
        .catch(err=>res.status(400).json(err));
}