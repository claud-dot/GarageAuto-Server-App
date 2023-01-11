var database =  require('../loaders/databases');
function configure(app) {
    database.mg_connect().then( db => {
        db.collection('users').find().toArray().then( users => {
            console.log(users);
        })
        app.use('/' , function (req, res, next) {
            res.send('Node Server Running ...');
        })
    })
}

exports.configure = configure;
