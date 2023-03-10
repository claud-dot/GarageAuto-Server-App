
const users = require('./users');
const auth = require('./auth');
const workshop = require('./workshop');
const cars = require('./cars');
const car_repair = require('./repair');
const invoice = require('./invoice');


function configure(app , database) {

    //Authentification
    auth(app,database);

    //Users
    users(app,database);

    //Responsable atelier
    workshop(app , database);

    //Car
    cars(app , database);

    //Repair
    car_repair(app,database);

    //Facture
    invoice(app , database);
}

exports.configure = configure;
