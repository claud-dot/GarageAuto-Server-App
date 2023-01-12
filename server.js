const express = require('express');
const routes = require("./routes/config");
const app = express();

require('dotenv').config();
// render.com
function startServer(){
    routes.configure(app);
    app.listen(process.env.PORT || 3000, err => {
        if (err) throw err;
        console.log('Server listening on port '+process.env.PORT || 3000);
    })
}

startServer();