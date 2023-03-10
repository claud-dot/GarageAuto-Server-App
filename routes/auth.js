const authController  = require('../controllers/auth.controller');

module.exports = (app,database) => {

    app.post('/auth/signup', (req , res , next)=>{
        authController.signUp(req.body , database , res); 
    });

    app.post('/auth/signin', (req, res , next) => {
        console.log("huhuhuhuh");
        authController.signIn(req.body, database , res , req);
    });

    app.post('/auth/signout', (req, res , next) => {
        authController.signOut(req , res , next)     
    });

    app.get('/auth/cookies' , (req , res , next)=>{
        authController.cookies(req, res , next);
    })

}