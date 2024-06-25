
const mongoose=require("mongoose");

const otpSchema=mongoose.Schema({
  
    email:{
        type:String,
        required:true
    },
    
    otp:{
        type:String,
        required:true
    },
    
    cteatedAt:{
        type:Date,
        dafault:Date.now(),
        expires:5*60
    }
});

//a function to send otp verification mail
async function sendVerificationMail(email,otp){
    //this function will send the email
    try{
   const mailResponse =await mailSender(email,"verification email otp",otp);
   console.log("email sent sucessfully",mailResponse);
    }
    catch(err){
        console.log("error in sending email verification code");
        throw err;
    
    }

}
//below middleware suggest that the before saving the email to the database we will sent otp to this mail and then save



otpSchema.pre("save",async function(next){              //this is a middleware
    await sendVerificationMail(this.email,this.otp);
    next();
})

module.exports=mongoose.model("Otp",otpSchema);