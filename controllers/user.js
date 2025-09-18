const User=require("../models/user.js");
const Booking=require("../models/booking.js");


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

//show bookings
module.exports.showBookings=async(req,res)=>{
    const bookings=await Booking.find({user:req.user._id}).populate("listing");
    res.render("./users/bookings.ejs",{bookings});
}

//show account settings
module.exports.showAccountSettings=(req,res)=>{
    res.render("./users/account-settings.ejs");
}

//update account settings
module.exports.updateAccountSettings=async(req,res)=>{
    const{username,email}=req.body;
    await User.findByIdAndUpdate(req.user._id,{username,email});
    req.flash("success","Account settings updated successfully");
    res.redirect("/account-settings");
}

//change password
module.exports.changePassword=async(req,res)=>{
    const{currentPassword,newPassword,confirmPassword}=req.body;
    if(newPassword !== confirmPassword){
        req.flash("error","New passwords do not match");
        return res.redirect("/account-settings");
    }
    try{
        await req.user.changePassword(currentPassword,newPassword);
        req.flash("success","Password changed successfully");
        res.redirect("/account-settings");
    }catch(e){
        req.flash("error","Current password is incorrect");
        res.redirect("/account-settings");
    }
}

//update booking dates
module.exports.updateBookingDates=async(req,res)=>{
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    // Check for conflicts with other bookings
    const conflict = await Booking.findOne({
        listing: (await Booking.findById(id)).listing,
        _id: { $ne: id },
        status: 'confirmed',
        $or: [
            { startDate: { $lte: newEndDate }, endDate: { $gte: newStartDate } }
        ]
    });

    if (conflict) {
        req.flash('error', `Sorry! This property is already booked from ${conflict.startDate.toLocaleDateString()} until ${conflict.endDate.toLocaleDateString()}.`);
        return res.redirect('/bookings');
    }

    await Booking.findByIdAndUpdate(id, { startDate: newStartDate, endDate: newEndDate });
    req.flash('success', 'Booking dates updated successfully.');
    res.redirect('/bookings');
}

//show owner bookings
module.exports.showOwnerBookings=async(req,res)=>{
    const ownerBookings = await Booking.find({}).populate({
        path: 'listing',
        match: { owner: req.user._id }
    }).populate('user');

    // Filter out bookings where listing is null (not owned by current user)
    const filteredBookings = ownerBookings.filter(booking => booking.listing !== null);

    res.render("./users/owner-bookings.ejs",{ownerBookings: filteredBookings});
}

