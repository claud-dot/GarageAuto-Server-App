const mongoose=require('mongoose');

const invoicesSchema=new mongoose.Schema({
    results_comment:Array,
    duration:Number,
    unit_duration:String,
    status:Number,
    repair_id:{
      type:mongoose.Schema.Types.ObjectId,
        ref:'repair'
    },
    create_at:{
        type:Date,
        default:new Date()
    },
    update_at:{
        type:Date,
        default:null
    }

})

module.exports = mongoose.model('invoices', invoicesSchema,'invoices');