const express = require('express');
const routes = require("./routes/config");
const app = express();

require('dotenv').config();

function startServer(){
    routes.configure(app); 
    app.listen( 3000, err => {
        if (err) throw err;
        console.log('Server listening on port ', 3000);
    })
}

startServer();