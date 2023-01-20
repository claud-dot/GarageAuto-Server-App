
const objectID = require('mongodb').ObjectId;

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

exports.getUser_cars = (database , req, res)=>{
    database.collection('user_cars').find({ user_id : objectID(req.params.id) }).toArray((err, user_cars) => {
        if(err){
            res.status(500).send(err);
            return;
        }
        res.status(200).send(user_cars);
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
        console.log(car_user);
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
