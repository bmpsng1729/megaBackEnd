const mongoose=require("mongoose");

const RatingAndReviewsSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    rating:{
        type:String
    },
    review:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model("RatingAndReview",RatingAndReviewsSchema);