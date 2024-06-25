const mongoose=require("mongoose");
const Course = require("./Course");

const tagsSchema=mongoose.Schema({
  
    name:{
        type:String,
        required:true
    },
    
    descriptionn:{
        type:String,
        required:true
    },
    
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    }
});

module.exports=mongoose.model("Course",courseSchema);