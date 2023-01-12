const express = require('express');
const bodyParser = require("body-parser");  
const database  = require('./loaders/databases');
const routes = require("./routes/config");
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


function startServer(){
    database.mg_connect().then( db => {
        routes.configure(app , db); 
        http.listen( process.env.NODE_PORT || 3000, err => {
            if (err) throw err;
            console.log('Server listening on port ', process.env.NODE_PORT || 3000);
        });
        
        app.get('/' , function (req, res, next) {
            res.send('Node Server Running ...');
        });
    });
}
startServer();

