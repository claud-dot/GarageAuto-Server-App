
const users = require('./users');
const auth = require('./auth');
const workshop = require('./workshop');


function configure(app , database) {

    //Authentification
    auth(app,database);

    //Users
    users(app,database);

    //Responsable atelier
    workshop(app , database);

}

exports.configure = configure;
