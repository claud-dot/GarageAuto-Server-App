require('dotenv').config();
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signUp = async (dataUser,database, res)=>{

    const userData = {
        username :  dataUser.username,
        email: dataUser.email,
        role : dataUser.role,
        password : bcrypt.hashSync(dataUser.password)
    };
    //check if role exists
    database.collection('user_role').findOne({ role : dataUser.role },(err, userRole) => {
        if(err){
            return res.status(500).send({ message: err });
        }
        
        if(!userRole){
            return res.status(400).send({ message: 'Failed! Role does not exist'});
        }
        
        //check if userName exists
        database.collection('users').findOne({ username : userData.username }, (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            
            console.log(err , user);
            if (user) {
                res.status(400).send({ message: 'Failed ! Username already in use !' });
                return;
            }
    
            //check if email exists
            database.collection('users').findOne({ email : userData.email },(err, user)=>{
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
        
                if (user) {
                    res.status(400).send({ message: "Failed! Email is already in use!" });
                    return;
                }
                userData.create_at = new Date();
                userData.update_at = new Date();
                database.collection("users").insertOne(userData, (err, result)=>{
                    if(err){
                        res.status(500).send({ message: err });
                        return;
                    }

                    if(result.insertedId){
                        res.status(200).send({ message: "User was registered successfully!" });
                    }
                });
            });
        });
    })
}

exports.signIn = async (dataUser,database, res , req)=>{
    
    database.collection('users').findOne({ email : dataUser.email , role : dataUser.role }, (err, user)=>{
        if(err){
            res.status(500).send({ message: err });
            return;
        }
        
        if (!user) {
            res.status(404).send({ message: "User Not found." });
            return;
        }
        
        var passwordIsValid = bcrypt.compareSync(dataUser.password, user.password);
        if (!passwordIsValid) {
            res.status(401).send({ message: "Invalid Password!" });
            return 
        }
        
        var token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, {
            expiresIn: '24h', // 24 hours
        });

        req.session.token = token;
        res.status(200).send({
            id : user._id,
            username : user.username,
            role : user.role,
            email : user.email,
            create_at : user.create_at,
            update_at : user.update_at
        });
    });
}

exports.signOut = async (req, res, next)=>{
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
}

exports.cookies= (req , res , next)=> {
    let token = req.session.token;
    if(!token){
        res.status(401).send({ message: "Unauthorized!" });
    }
    res.status(200).send({ token : token });
  }
