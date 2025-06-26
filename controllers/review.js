const Listing=require("../models/listing.js");
const Review=require("../models/review.js");


module.exports.reviewroute=async(req,res)=>{
 let listing=await Listing.findById(req.params.id);
 let newReview =new Review(req.body.review);
 newReview.author=req.user._id;
 
 await newReview.save();
 await Listing.findByIdAndUpdate(req.params.id, { $push: { reviews: newReview._id } });

req.flash("success","Your Review was Added Successfully");
res.redirect(`/listings/${listing._id}`);

}

module.exports.deleteroute=async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Your Review was Deleted Successfully");
    res.redirect(`/listings/${id}`);
}