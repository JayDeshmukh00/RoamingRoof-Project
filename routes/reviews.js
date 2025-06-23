const express=require("express");
const router=express.Router({mergeParams:true});
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError");
const {validateReview,isLoggedIn,isReviewAuthor}=require("./middlewear.js");
const Review=require("../models/review.js");
const reviewRoute=require("../controllers/review.js");

//Reviews
//post review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewRoute.reviewroute));

//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewRoute.deleteroute));

module.exports=router;
