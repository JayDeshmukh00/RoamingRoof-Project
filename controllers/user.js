const User=require("../models/user.js");


//post signup

module.exports.signup=async(req,res)=>{
    try{
let{username,email,password}=req.body;
    const newUser=new User({
        username,
        email
    });
    const registeredUser= await User.register(newUser,password);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","Welcome to Roaming Roof");
    res.redirect("/listings");
    })
    
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
    

}

//get signup
module.exports.showsignup=(req,res)=>{
    res.render("./users/signup.ejs");
}

//get login
module.exports.showlogin=(req,res)=>{
    res.render("./users/login.ejs");
}

//post login
module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back to RoamingRoof!");
    res.redirect("/listings");
    //  res.redirect(res.locals.redirectUrl);

}


//logout
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
   if(err){
    return next(err);
   }
   req.flash("success","Logged out successfully");
   res.redirect("/listings");
    })
}

