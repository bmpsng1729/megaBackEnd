const mongoose=require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUlrParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>{
        console.log("DB connected sucessfully");
    })
    .catch((err)=>{
        console.errror(err);
        console.log("DB connection failed");
        process.exit(1);
    })
};

