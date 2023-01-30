const userContoller = require('../controllers/users.controller');
const authVerify = require('../middlewares/authVerify');


module.exports = (app, database) => {

    app.get('/users', [authVerify.verifyToken], (req, res) => {
        userContoller.getUser(database, res);
    });

    app.get('/user_roles', (req, res) => {
        userContoller.getUser_role(database, res);
    })

    app.get('/user/cars/:data', (req, res) => {
        userContoller.getUser_cars(database, JSON.parse(req.params.data), res);
    })

    app.post('/user/add-car', [authVerify.verifyToken], (req, res) => {
        userContoller.addCar_user(database, req, res);
    })
    app.get('/user/simulate/:data', [authVerify.verifyToken], (req, res) => {
        userContoller.simulateDepense(database, JSON.parse(req.params.data), res);
    })
    app.get('/user/get/:id', (req, res) => {
        console.log("ato")
        userContoller.getUserById(req, res, req.params.id.trim());
    })
}

