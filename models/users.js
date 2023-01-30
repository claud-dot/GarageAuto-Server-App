const mongoose=require('mongoose');

const usersSchema=new mongoose.Schema({
    username:String,
    email:String,
    role:String,
    password:String,
    create_at:{
        type:Date,
        default:new Date()
    },
    update_at:{
        type:Date,
        default:null
    }

})

module.exports = mongoose.model('users', usersSchema,'users');