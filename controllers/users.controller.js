
exports.getUser = (database, res ) => {
    
    database.collection('users').find().toArray((err, users) => {
        if(err){
            res.status(500).send(err);
            return;
        }

        res.status(200).send(users);
    });
};

exports.getUser_role = (database , res)=>{
    database.collection('user_role').find().toArray((err, roles) => {
        if(err){
            res.status(500).send(err);
            return;
        }

        res.status(200).send(roles);
    });
}
