const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { isLoggedIn } = require("./middlewear.js");
const controller = require("../controllers/user.js");

//signup
router.get("/signup", controller.showsignup);
router.post("/signup", wrapAsync(controller.signup));

//login
router.get("/login", controller.showlogin);
router.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), controller.login);

//logout
router.get("/logout", controller.logout);

//bookings
router.get("/bookings", isLoggedIn, wrapAsync(controller.showBookings));
router.post("/bookings/:id/update-dates", isLoggedIn, wrapAsync(controller.updateBookingDates));

//account settings
router.get("/account-settings", isLoggedIn, wrapAsync(controller.showAccountSettings));
router.post("/account-settings", isLoggedIn, wrapAsync(controller.updateAccountSettings));
router.post("/change-password", isLoggedIn, wrapAsync(controller.changePassword));

//owner bookings
router.get("/owner-bookings", isLoggedIn, wrapAsync(controller.showOwnerBookings));

module.exports = router;
