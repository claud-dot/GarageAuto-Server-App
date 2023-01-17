const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");  
const database  = require('./loaders/databases');
const routes = require("./routes/config");
const app = express();
const http = require('http').createServer(app);

require('dotenv').config();

app.use(cors({
    origin : [process.env.CLIENT_LOCAL_URL , process.env.CLIENT_PROD_URL]
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
      name: "garazeAuto-session",
      secret: process.env.COOKIE_SECRET, // should use as secret environment variable
      httpOnly: true
    })
);

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
