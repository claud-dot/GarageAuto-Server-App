const jwt = require("jsonwebtoken");
require("dotenv").config({ path: `${__dirname}/../.env` });


exports.verifyToken = (req, res, next) => {

    let token = req.session.token;
    if (!token) {
      res.status(403).send({ message: "No token provided!" });
      return;
    }
  
    jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      req.userId = decoded.id;
      next();
    });
};
