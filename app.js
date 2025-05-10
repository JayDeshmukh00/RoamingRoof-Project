const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ejs=require("ejs");
const Listing=require("./models/listing.js");
const path=require("path");
const ejsMate=require("ejs-mate")
const methodOverrride=require("method-override")

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverrride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")))

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
//index route
app.get("/listings",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
    
})

//new route
app.get("/listings/new",async(req,res)=>{
    res.render("./listings/new.ejs",);

})



//show route
app.get("/listings/:id",async(req,res)=>{
const {id}=req.params;
const listing=await Listing.findById(id);
res.render("./listings/show.ejs",{listing})

})



//create route

app.post("/listings",async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})


//edit route

app.get("/listings/:id/edit",async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing})
    console.log(listing);
})
//update route

app.put("/listings/:id",async (req,res)=>{
    let{id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);
})

//delete route

app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})