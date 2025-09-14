const express=require("express");
const router=express.Router();
const{listingSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync");
const{isLoggedIn,isOwner,validateListing}=require("./middlewear.js");
const controller=require("../controllers/listings.js");
const multer=require("multer");
const{storage}=require("../cloudConfig.js");
const upload=multer({storage});


//new route
router.get("/new",isLoggedIn,wrapAsync(controller.newroute));

router
.route("/")
.get(wrapAsync(controller.indexroute))//index route
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(controller.createroute));//create route


//search route
router.get("/search",wrapAsync(controller.searchroute));

router
.route("/:id")
.get(wrapAsync(controller.showroute))//show route
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(controller.updateroute))//validate update listing
.delete(isLoggedIn,isOwner,wrapAsync(controller.destroyroute))//delete listing


//edit route

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(controller.editroute));



module.exports=router;