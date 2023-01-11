 function configure(app) {
     app.use('/' , function (req, res, next) {
         res.send('Node Server Running ...');
     })
 }

 exports.configure = configure;
