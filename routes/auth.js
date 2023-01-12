const authController  = require('../controllers/auth.controller');

module.exports = (app,database) => {

    app.post('/auth/signup',async (req , res , next)=>{
        authController.signUp(req.body , database , res)
    });

    app.post('/auth/signin', (req, res , next) => {
        authController.signIn(req.body, database , res);
    });

    app.post('/auth/signout', (req, res , next) => {
        authController.signOut(req , res , next)
    });

}