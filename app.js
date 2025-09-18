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
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local");
const User=require("./models/user.js");
const Listing=require("./models/listing.js");
const Booking=require("./models/booking.js");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverrride("_method"));
app.engine("ejs",ejsMate);


app.use(express.static(path.join(__dirname,"public")));


// const Mongo_Url="mongodb://127.0.0.1:27017/RoamingRoof";
const atlasUrl=process.env.ATLASDB_URL

async function main(){
    await mongoose.connect(atlasUrl);
}
main().then(()=>console.log("database connection successful"))
.catch((err)=>console.log("error occured while connecting to database",err));

app.get("/",(req,res)=>{
res.render("./listings/landing.ejs")
})

app.get("/help",(req,res)=>{
    res.render("./help.ejs")
})

app.get("/support",(req,res)=>{
    res.render("./support.ejs")
})

app.get("/privacy",(req,res)=>{
    res.render("./privacy.ejs")
})

app.get("/terms",(req,res)=>{
    res.render("./terms.ejs")
})

//Mongo Store
const store=MongoStore.create({
mongoUrl:atlasUrl,
crypto: {
    secret:process.env.SECRET

  },
  touchAfter:24*3600,
});

store.on("error",(err)=>{
    console.log("Error in Mongo Session Store",err)
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
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
