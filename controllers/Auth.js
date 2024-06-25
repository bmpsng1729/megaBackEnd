//send OTP

const {User, findOne}=require("../models/User");
const {Otp}=require("../models/Otp");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
require("dotenv").config();

exports.sendOtp=async(req,res)=>{
try{
    //take email from request body
const {email}=req.body;
const checkUserExist=await User.findOne({email});
if(checkUserExist){
    res.status(401).json({
        sucess:false,
        message:"user already registered"
    })
}

//now generate the otp
var otp=otpGenerator.generate(4,{
    upperCaseAlphabets:false,
    lowerCaseAlphabets:false,
    specialChars:false,
});

//now check this otp is unique or not
const result=await Otp.findOne({otp:otp});
while(result){
    //repeat the process unless you got unique otp
    otp=otpGenerator.generate(4,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    result=await Otp.findOne({otp:otp});

}
//now make a payload
const otpPayload={email,otp};
//create an entry in db for otp
const otpBody=await Otp.create(otpPayload);
console.log(otpPayload);
//return a sucessfull response
 return res.status(400).json({
    sucess:false,
    message:"otp saved sucessfully into the database",
    error:err
});

}
catch(err){

}
};


//signUp

exports.signUp=async (req,res)=>{
try{
    //all steps to do

    //fetch the data from the request body
    const{
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        otp
    }=req.body;
    //validate ecach and efery values
    if(!firstName ||!lastName ||!email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            sucess:false,
            message:"all mandatory fields are not filled"
        });

    }

    //apply validatation
     //check confirm password and password are same or not
     if(password !=confirmPassword){
        return res.status(403).json({
            sucess:false,
            message:"password and confirm password not matched!"
        });
     }
     //check if user already exists or not
      const exitstingUSer=await User.findOne({email});
      if(exitstingUSer){
        return res.status(401).json(
            {
                sucess:false,
                message:"this mail/user is already registered"
            }
        );
      }

    //take otp from db and match 
         //find the most recent otp.
         const recentOtp=await Otp.findOne({email}).sort({createdA:-1}).limit(1);

         if(recentOtp.length==0){
            return res.status(401).json({
                sucess:false,
                message:"otp not found"
            });
         }

         if(otp !=recentOtp){
            return res.status(401).json({
                sucess:false,
                message:"you have entered an invalid otp"
            });
         }

        


    //hash password
    const hashedPassword=bcrypt.hash(password,10);

    //now create entry in the database
    const profileDetails= await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null
     });

     const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetais:profileDetails._id,
           //now insert the imgae using 
     //third party api->diceBear
     image:`https:api.dicebear.com/5.x/initials/sbg?seed=${firstName} ${lastName

     }`
     });

     

    //return the response
    res.status(400).json({
        message:"sucessfully signed up",
        user
    })
    }
    catch(err){

        console.log("error in sign-up");
        console.error(err);
        return res.status(401).json({
            sucess:false,
            message:"user is not signed up ,please try again",
            user
        });
    }

}
//logIn code
exports.login=async(req, res)=>{
    try{
     //get data from the request body
     const {email,password}=req.body;

     //data validattion
     if(!email || !password){
        return res.status(401).json({
            sucess:false,
            message:"All field are mandatory for sign in"
        });
     }
     //check user exist or not

     const user=await User.findOne({email}).populate("additionalDetais");
     if(!user){
        res.status(401).json({
            sucess:false,
            message:"user has not signed in please sign up first"
        });
     }
     //generate JWT,after password matching
      if(await bcrypt.compare(password,user.password)){
        const payload={
            email:user.email,
            id:user._id,
            role:user.role,
        };
        const token=jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h",

        });
        user.token=token;
        user.password=undefined
      
     
     //crate cookie and send response

    const options={
        expiresIn:new Date(Date.now()+3*60*60*60*24*1000),
        httpyOnly:true
    };
    //below we aree passing name,value,options
    res.cookie("token",token,options).status(200).json({
        sucess:true,
        token,
        user,
        message:"logged in sucessfully"
    })
}
else{
    return res.status(401).json({
       message:"Entered password is incorrect",
       sucess:false
    });
  }
    }
    catch(err){
   console.log("error in sign in");
   console.error(err);
   return res.status(401).json({
    sucess:false,
    message:"user faced problem in log in"
   });
    }
}
//changePassword
