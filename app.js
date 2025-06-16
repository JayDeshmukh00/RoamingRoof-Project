const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ejs=require("ejs");

const path=require("path");
const ejsMate=require("ejs-mate");
const methodOverrride=require("method-override");

const ExpressError=require("./utils/ExpressError");

const listings=require("./routes/listings.js")
const reviews=require("./routes/reviews.js")




app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverrride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

const Mongo_Url="mongodb://127.0.0.1:27017/RoamingRoof";

async function main(){
    await mongoose.connect(Mongo_Url);
}
main().then(()=>console.log("database connection successful"))
.catch((err)=>console.log("error occured while connecting to database",err));

app.listen(8000,()=>{
    console.log("http://localhost:8000");
})

app.get("/",(req,res)=>{
res.render("./listings/landing.ejs")
})



app.all("*",(req,res,next)=>{
   next(new ExpressError(404,"page not found!"));

})

//handling errors
app.use((err,req,res,next)=>{
    let{status_code=404,message="Something went wrong"}=err
    res.status(status_code).render("./listings/error.ejs",{message});
    // res.status(status_code).send(message);
});  