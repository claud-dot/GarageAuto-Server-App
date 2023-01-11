require('dotenv').config(); 
const MongoClient = require('mongodb').MongoClient;

exports.mg_connect = async () =>{
    return await MongoClient.connect(process.env.MG_URI  , 
        { useUnifiedTopology: true }).then (database => {
            console.log("Connected to MongoDB at Db_name : '" + process.env.MG_DBNAME+"' ");
            return database.db(process.env.MG_DBNAME); 
    }).catch(err => {
        console.error(err) 
    });
}