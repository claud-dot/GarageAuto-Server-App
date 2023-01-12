
const users = require('./users');
const auth = require('./auth');


function configure(app , database) {
    
    //Authentification
    auth(app,database);
}

exports.configure = configure;
