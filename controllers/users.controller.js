const Repair = require("../models/repair");

const objectID = require('mongodb').ObjectId;
const utils = require('../utils');

const User=require("../models/users")

exports.getUser = (database, res ) => {
    
    database.collection('users').find().toArray((err, users) => {
        if(err){
            res.status(500).send(err);
            return;
        }

        res.status(200).send(users);
    });
};

exports.getUser_role = (database , res)=>{
    database.collection('user_role').find().toArray((err, roles) => {
        if(err){
            res.status(500).send(err);
            return;
        }

        res.status(200).send(roles);
    });
}

function creatOjectMatch(data){
    if(data.search){
        if(data.search.filter!=null && data.search.text!=null){
            return {
                user_id : objectID(data.user_id), 
                [data.search.filter]: { $regex : "^.*"+data.search.text+".*" , $options : "i" } 
            }
        }else if(data.search.text==null && data.search.dates[0].start!='') {
            const dateOject = {
                user_id : objectID(data.user_id),
                [data.search.filter] : { $gte :  new Date(data.search.dates[0].start+'') ,  $lte :  new Date(data.search.dates[0].end+'') }
            }
            if(dateOject[data.search.filter].$lte+''=='Invalid Date'){
                delete dateOject[data.search.filter].$lte;
            }
            return dateOject ;
        }else{
            return { 
                user_id : objectID(data.user_id), 
                "mark": { $regex : "^.*"+data.search.text+".*" , $options : "i" } 
            }
        }
    }else{
        return  { user_id : objectID(data.user_id) }
    }
}

exports.getUser_cars = (database , data, res)=>{
    const pipeline = [
        { $match : creatOjectMatch(data)},
        { $sort : { create_at : -1 } },
        { $facet : {
            metadata : [
                { $count : "total" },
                { $addFields : { page : data.page }}
            ],
            data : [
                { $skip : data.page > 0 ? ((data.page - 1 )* data.nbBypage) : 0 },
                { $limit : data.nbBypage }
            ]
        } }
    ]
    database.collection('user_cars').aggregate(pipeline).toArray((err, data_cars)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        res.status(200).send(data_cars[0]);
    });
}

exports.addCar_user = (database , req , res) =>{
    const car_user= {
        user_id : objectID(req.body.user_id),
        mark : req.body.mark,
        model : req.body.model,
        year_of_manufacture : req.body.year_of_manufacture
    }
    database.collection('user_cars').findOne(car_user , (err , car)=>{
        if(err){
            res.status(500).send({ message: err });
            return;
        }
        
        if (car) {
            res.status(404).send({ message: "Failed ! , you already own this car" });
            return;
        }
        car_user.create_at = new Date();
        car_user.update_at = new Date();
        database.collection('user_cars').insertOne(car_user , (err , result)=>{
            if(err){
                res.status(500).send({ message: err });
                return;
            }

            if(result.insertedId){
                res.status(200).send({ message: "Your car added successfully!" });
            }
        })
    });
}
exports.listRequest=(req,res)=>{
    Repair.find()
        .then(repairs=>{
            res.json(repairs);
        })
        .catch(err=>err.status(400).json(err));
};

exports.getUserById=(req,res,id)=>{
    User.findById(id).exec()
        .then(user => {
            res.json(user);
        })
        .catch(err=>res.status(400).json(err))
}
//Financier
exports.simulateDepense = (database ,dataSimulation , res)=>{
    const req = {
        params : {
            unit_duration: "mois"
        }
    }
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
        if(dataSimulation.choice =='global'){
            dataSend.dataStat = utils.getBeneficeGlobal(dataSend.dataStat , dataSimulation);
        }else{
            dataSend.dataStat = utils.getBeneficeMois(dataSend.dataStat, dataSimulation);
        }
        res.status(200).send(dataSend);
    });
}

exports.update_photo_car = (dataBase ,  dataCar , res )=>{
    dataBase.collection('user_cars').findOneAndUpdate({ _id : objectID(dataCar.id_car) } , 
        { $set : { img_url : dataCar.image, update_at : new Date() } } , (err , response)=>{
            if (err) {
                res.status(500).send({ message : err });
                return;
            }
            if(!response.value){
                res.status(403).send({ message : "Car inexist !" });
                return;
            }
            res.status(200).send({ message : "Car photo changed successfully !" });
    });
}

exports.deleteCar = (database , data , res ) =>{
    database.collection('user_cars').findOneAndDelete({ _id : objectID(data.id_car) , user_id : objectID(data.user_id) } , (err , response)=>{
        if (err) {
            res.status(500).send({ message : err });
            return;
        }
        if(!response.value){
            res.status(403).send({ message : "Car inexist !" });
            return;
        }
        database.collection('repair').findOneAndDelete({ "user_car._id" : objectID(data.id_car) } , (err , repair)=>{
            if (err) {
                res.status(500).send({ message : err });
                return;
            }
            console.log(repair);
            database.collection('invoices').deleteMany({ repair_id :  objectID(repair.value._id)} , (err , response)=>{
                if (err) {
                    res.status(500).send({ message : err });
                    return;
                }
                res.status(200).send({ message : "Car deleted successfully !" });
            });
        })
    });
}