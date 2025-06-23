if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ejs=require("ejs");
const path=require("path");
const ejsMate=require("ejs-mate");
const methodOverrride=require("method-override");
const ExpressError=require("./utils/ExpressError");
const listingRoute=require("./routes/listings.js")
const reviewRoute=require("./routes/reviews.js")
const userRoute=require("./routes/users.js");
const session =require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local");
const User=require("./models/user.js");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverrride("_method"));
app.engine("ejs",ejsMate);


app.use(express.static(path.join(__dirname,"public")));


const Mongo_Url="mongodb://127.0.0.1:27017/RoamingRoof";

async function main(){
    await mongoose.connect(Mongo_Url);
}
main().then(()=>console.log("database connection successful"))
.catch((err)=>console.log("error occured while connecting to database",err));

app.get("/",(req,res)=>{
res.render("./listings/landing.ejs")
})

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }

};




app.use(session(sessionOptions));
app.use(flash());


//passport config

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





 
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
 next();
})
  
app.get("/demouser",async(req,res)=>{
let fakeuser=new User({
    email:"abc@gmail.com",
    username:"jay",
});
const registeredUser= await User.register(fakeuser,"helloworld");
res.send(registeredUser);
})






app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute);
app.use("/",userRoute)







app.all("*",(req,res,next)=>{
   next(new ExpressError(404,"page not found!"));

})

//handling errors
app.use((err,req,res,next)=>{
    let{status_code=404,message="Something went wrong"}=err
    res.status(status_code).render("./listings/error.ejs",{message});
    // res.status(status_code).send(message);
});  




app.listen(8000,()=>{
    console.log("http://localhost:8000");
})
