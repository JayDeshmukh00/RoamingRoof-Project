const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync");
const passport=require("passport");
const{savedRedirectUrl}=require("./middlewear.js")
const userController=require("../controllers/user.js")


router.route("/signup")
.get(userController.showsignup)
.post(wrapAsync(userController.signup));



router.route("/login")
.get(userController.showlogin)
.post(savedRedirectUrl,passport.authenticate(
    "local",{
        failureFlash:true,
        failureRedirect:"/login"
    }),
    (userController.login)
);



router.get("/logout",userController.logout)





module.exports=router;