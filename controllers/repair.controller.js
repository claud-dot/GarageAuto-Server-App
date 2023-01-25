
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

function creatOjectMatch(data){
    if(data.search){
        if(data.search.filterCar!=null && data.search.text!=null && data.search.filterStatus !=null  && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                ["user_car."+data.search.filterCar]: { $regex : "^.*"+data.search.text+".*" , $options : "i" },
                status : parseInt(data.search.filterStatus)
            }
        }else if(data.search.filterCar==null && data.search.text!=null && data.search.filterStatus !=null  && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                "user_car.mark": { $regex : "^.*"+data.search.text+".*" , $options : "i" } ,
                status : parseInt(data.search.filterStatus)
            }
        }else if(data.search.filterCar!=null && data.search.text!=null && data.search.filterStatus ==null && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                ["user_car."+data.search.filterCar]: { $regex : "^.*"+data.search.text+".*" , $options : "i" } 
            }
        }else if(data.search.filterCar==null && data.search.text==null && data.search.filterStatus !=null  && data.search.date==null){
            return {
                "user_car.user_id" : objectID(data.user_id), 
                status : parseInt(data.search.filterStatus)
            }
        }else if(data.search.filterStatus !=null && data.search.date!=null) { 
            return {
                "user_car.user_id" : objectID(data.user_id),
                ["user_car."+data.search.filterCar] : { $gte :  new Date(data.search.date+'') },
                status : parseInt(data.search.filterStatus)
            } 
        }else if(data.search.filterStatus==null && data.search.date!=null) { 
            return {
                "user_car.user_id" : objectID(data.user_id),
                ["user_car."+data.search.filterCar] : { $gte :  new Date(data.search.date+'') },
            } 
        }else if(data.search.text!=null){
            return { 
                "user_car.user_id" : objectID(data.user_id),
                "user_car.mark": { $regex : "^.*"+data.search.text+".*" , $options : "i" } ,
            }
        }else{
            return  { "user_car.user_id" : objectID(data.user_id) }
        }
    }else{
        return  { "user_car.user_id" : objectID(data.user_id) }
    }
}

exports.getRepairUser= (database , data , res)=>{
    const pipeline = [
        { $match : creatOjectMatch(data)},
        { $sort : { create_at  : -1 } },
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
        res.status(200).send( car_repairs ); 
    });
}

exports.getRepairCarStory = (database , req , res)=>{
    const data = JSON.parse(req.params.data);
    const dataMatch = data.status=="null" ? 
                    { "user_car._id" : objectID(data.car_id) , "user_car.user_id" : objectID(data.user_id) } : 
                    {"user_car._id" : objectID(data.car_id) , "user_car.user_id" : objectID(data.user_id) , status : parseInt(data.status) } ;
    const pipeline = [
        { $match : dataMatch },
        { $sort : { create_at  : -1 } },
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
        var car_repairs = repairs[0];
        res.status(200).send( car_repairs );
    })
}