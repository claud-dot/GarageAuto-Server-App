var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signUp = async (dataUser,database, res)=>{

    const user = {
        name: dataUser.name,
        lastname: dataUser.lastname,
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
        database.collection('users').findOne({ name : user .name , lastname : user.lastname }, (err, user) => {
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
            
                database.collection("users").insertOne(dataUser, (err, result)=>{
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

exports.signIn = async (dataUser,database, res)=>{
    const userData = {
        email : dataUser.email,
        role : dataUser.role,
        password : bcrypt.hashSync(dataUser.password)
    }

    database.collection('users').findOne(user, (err, user)=>{
        if(err){
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(userData.password, user.password);
        console.log(passwordIsValid);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password!" });
        }
        
        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400, // 24 hours
        });

        req.session.token = token;

        res.status(200).send({
            id: user._id,
            name: user.name,
            lastname : user.lastname,
            email: user.email,
            role: user.role,
        });
    });
}

exports.signOut = async (req, res, next)=>{
    req.session.destroy((err)=>{
        if(err){
            res.status(500).send({ message: err });
            return;
        }

        res.status(200).send({ message: "User logged out successfully!" });
    });
}
