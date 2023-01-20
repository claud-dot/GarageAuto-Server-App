
const objectID = require('mongodb').ObjectId;

function insertRepair (database  , car_user, req , res){
    const repair = {
        user_car : car_user,
        comment : req.body.comment,
        advancement : 0.0,
        status : 0,
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

exports.addReparation = (database  , req, res) =>{
    const car_user= {
        user_id : objectID(req.body.user_id),
        mark : req.body.mark,
        model : req.body.model,
        year_of_manufacture : req.body.year_of_manufacture
    }

    //find voiture user
    database.collection('user_cars').findOne(car_user , (err , car)=>{
        if(err){
            res.status(500).send({ message: err });
            return;
        }

        //Rah tss dia inserena
        if (!car) {
            console.log("car not exist");
            car_user.create_at = new Date();
            car_user.update_at = new Date();
            
            database.collection('user_cars').insertOne(car_user , (err , result)=>{
                if(err){
                    res.status(500).send({ message: err });
                    return;
                }
    
                if(result.insertedId){
                    car_user._id = result.insertedId;
                    insertRepair(database , car_user , req , res);
                }
            })
        }else{
            console.log("car exist");
            insertRepair(database , car , req , res);
        }
    })
}