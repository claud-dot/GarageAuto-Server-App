exports.getCars = (database  , res)=>{
    
    database.collection('cars').find().toArray((err , cars)=>{
        if(err){
            res.status(500).send({ message : err });
            return;
        }
        res.status(200).send(cars);
    })
}
