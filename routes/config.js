var database =  require('../loaders/databases');
function configure(app) {
    //database.mg_connect().then( db => {
        app.use('/' , function (req, res, next) {
            res.send('Node Server Running ...');
        })
    //})
}

exports.configure = configure;
