require('dotenv').config(); 
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');

exports.mg_connect = async () =>{
    return await MongoClient.connect(process.env.MG_URI  , 
        { useUnifiedTopology: true }).then (database => {
            console.log("Connected to MongoDB at Db_name : '" + process.env.MG_DBNAME+"' ");
            return database.db(process.env.MG_DBNAME); 
    }).catch(err => {
        console.error(err)  
    });
}

exports.mongoose_connect = async () => {
    return mongoose.connect(process.env.MG_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'garage-auto'
    }).then(() => {
        console.log("Connected to Mongoose!");
        // Perform other actions here
    }).catch(err => {
        console.error(err)  
        console.log("Error connecting to Mongoose: ", err);
    });
}