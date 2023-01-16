
const users = require('./users');
const auth = require('./auth');
const workshop = require('./workshop');
const cars = require('./cars');


function configure(app , database) {

    //Authentification
    auth(app,database);

    //Users
    users(app,database);

    //Responsable atelier
    workshop(app , database);

    //Car
    cars(app , database);

}

exports.configure = configure;
