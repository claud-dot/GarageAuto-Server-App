
require('dotenv').config();
const convict = require('convict');

const config = convict({
    env: {
      format: ['production', 'development'],
      default: 'development',
      arg: 'nodeEnv',
      env: 'NODE_ENV'
    },
    cookie_session : {
        secure : {
            format : Boolean, 
            default : true,
            arg : "secure",
        },
        sameSite : {
            format : String,
            default : "none",
            arg : "samesite",
        }
    }
});
   
const env = config.get('env');
config.loadFile(`./config/${env}.json`);
   
config.validate({ allowed: 'strict' }); // throws error if config does not conform to schema

module.exports = config.getProperties(); // so we can operate with a plain old JavaScript object and abstract away convict (optional)
   

