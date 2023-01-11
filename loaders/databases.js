require('dotenv').config(); 
const MongoClient = require('mongodb').MongoClient;

exports.connect = async () =>{
    return await MongoClient.connect(process.env.MgDB_Uri  , 
        { useUnifiedTopology: true }).then (database => {
            console.log("Connected to MongoDB at Db_name : '" + process.env.MgDB_Database+"' ");
            return database.db(process.env.MgDB_Database);
    }).catch(err => {
        console.error(err)
    });
}