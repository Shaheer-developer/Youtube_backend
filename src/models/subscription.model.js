import mongoose from "mongoose";

const sucbscriptionSchema = new mongoose.Schema({
subscriber:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"   
},
channel:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" 
},
},{timestamps:true})

export const Subscription = mongoose.model("Subscription" , sucbscriptionSchema)