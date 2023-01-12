const jwt = require("jsonwebtoken");

exports.checkDuplicateUsernameOrEmail = (database ,signUp ,req , res , next) => {
    const dataUser = req.body;
    console.log(dataUser);
    
    var userName = { name : dataUser.name , lastname : dataUser.lastname };
    
    //check if username exists
    database.collection('users').findOne(userName, (err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (user) {
            res.status(400).send({ message: 'Failed ! Username already in use !' });
            return;
        }

        //check if email exists
        database.collection('users').findOne({ email : dataUser.email },(err, user)=>{
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
    
            if (user) {
                res.status(400).send({ message: "Failed! Email is already in use!" });
                return;
            }
            signUp();
        });
    });
}

exports.checkRoleExisted = async (database , signUp , req , res , next) => {
    const dataUser = req.body;
    await database.collection('user_role').findOne({ role : dataUser.role },(err, userRole) => {
        if(err){
           return res.status(500).send({ message: err });
        }
        
        if(!userRole){
            return res.status(400).send({ message: 'Failed! Role does not exist'});
        }
        this.checkDuplicateUsernameOrEmail(database , signUp , req, res, next);
    });
};

exports.verifyToken = (req, res, next) => {
    let token = req.session.token;
  
    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }
  
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      req.userId = decoded.id;
      next();
    });
  };
