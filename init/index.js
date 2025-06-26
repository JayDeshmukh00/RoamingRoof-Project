const express=require("express");
const app=express();
const mongoose=require("mongoose");
const listing=require("../models/listing.js")
const initData=require("./data.js")
const ejs=require("ejs");
const Mongo_Url="mongodb://127.0.0.1:27017/RoamingRoof";

async function main(){
    await mongoose.connect(Mongo_Url);
}
main().then(()=>console.log("database connection successful"))
.catch((err)=>console.log("error occured while connecting to database",err));

app.listen(8000,()=>{
    console.log("http://localhost:8000");
})

initDB=async()=>{
   await listing.deleteMany({});
   initData.data=initData.data.map((obj)=>({...obj,owner:"68582a2ae7f8874ae73ebc44"}));
   await listing.insertMany(initData.data);
   console.log("data reinitialized successfully");
}
initDB();