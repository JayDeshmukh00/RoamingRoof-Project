const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("./middlewear.js");
const controller = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//new route
router.get("/new", isLoggedIn, wrapAsync(controller.newroute));

router
    .route("/")
    .get(wrapAsync(controller.indexroute)) //index route
    // UPDATED: Changed from upload.array("listing[images]", 5) to upload.array("images", 5)
    .post(isLoggedIn, upload.array("images", 5), validateListing, wrapAsync(controller.createroute)); //create route

//search route
router.get("/search", wrapAsync(controller.indexroute));

router
    .route("/:id")
    .get(wrapAsync(controller.showroute)) //show route
    // UPDATED: Changed from upload.array("listing[images]", 5) to upload.array("images", 5)
    .put(isLoggedIn, isOwner, upload.array("images", 5), validateListing, wrapAsync(controller.updateroute)) //validate update listing
    .delete(isLoggedIn, isOwner, wrapAsync(controller.destroyroute)); //delete listing

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(controller.editroute));

// --- UPDATED BOOKING/CONTACT ROUTES ---
router.post("/:id/contact", isLoggedIn, wrapAsync(controller.contactOwner));
router.post("/:id/book", isLoggedIn, wrapAsync(controller.createBooking));


module.exports = router;
