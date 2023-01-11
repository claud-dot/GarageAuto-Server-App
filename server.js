const express = require('express');
const routes = require("./routes/config");
const app = express();

require('dotenv').config();

function startServer(){
    routes.configure(app);
    app.listen(process.env.APP_PORT || 3000, err => {
        if (err) throw err;
        console.log('Server listening on port '+process.env.APP_PORT || 3000);
    })
}

startServer();