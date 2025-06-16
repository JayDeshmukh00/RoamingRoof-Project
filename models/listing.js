const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const review=require("./review.js")
const listingSchema=new Schema({
    title:{
        type:String,
        required:true,

    },
    description:{
type:String,
required:true,
    },
    image: {
        type:String,
        default: "https://images.pexels.com/photos/23696832/pexels-photo-23696832/free-photo-of-palm-trees-in-a-sea-resort-at-night.jpeg",
        set: (v) => v || "https://images.pexels.com/photos/23696832/pexels-photo-23696832/free-photo-of-palm-trees-in-a-sea-resort-at-night.jpeg"
    }
    ,
   price:{
    type:Number,
    required:true
   },

   location:{
    type:String,
    required:true
   },

   country:{
    type:String,
    required:true
   },
reviews:[
    {
        type:Schema.Types.ObjectId,
        ref:"Review"
    }
],



} )


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await review.deleteMany({_id:{$in:listing.reviews}})
    }
});


const listing=mongoose.model("listing",listingSchema);
module.exports=listing;