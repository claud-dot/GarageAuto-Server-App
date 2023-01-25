const mongoose=require('mongoose');

const repairSchema=new mongoose.Schema({
    user_car:Object,
    comment:String,
    advancement:Number,
    status:Number,
    create_at:{
        type:Date,
        default:new Date()
    },
    update_at:{
        type:Date,
        default:null
    }

})

module.exports = mongoose.model('repair', repairSchema,'repair');