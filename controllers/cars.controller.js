
const objectID = require('mongodb').ObjectId;
exports.getCars = (database  , res)=>{
    
    database.collection('cars').find().toArray((err , cars)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        res.status(200).send(cars);
    })
}

exports.getCar = (database , req, res )=>{
    console.log(req.params.id_car);
    database.collection('user_cars').findOne({ _id : objectID(req.params.id_car) } , (err , car)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        console.log(car);
        res.status(200).send(car);
    })
}
