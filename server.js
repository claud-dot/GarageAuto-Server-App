const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");  
const database  = require('./loaders/databases');
const routes = require("./routes/config");
const app = express();
const http = require('http').createServer(app);

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true
}));


function startServer(){
    database.mg_connect().then( db => {
        routes.configure(app , db); 
        http.listen( process.env.NODE_PORT || 3000, err => {
            if (err) throw err;
            console.log('Server listening on port ', process.env.NODE_PORT || 3000);
        });
        
    });
}

startServer();

app.get('/' , function (req, res, next) {
    res.send('Node Server Running ...');
});
