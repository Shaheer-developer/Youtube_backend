// require('dotenv').config({path:'/.env'})
import dotenv from "dotenv"
import connect_db from "./db/index.js";

dotenv.config({
    path: "/.env"
})

connect_db()
    .then(()=>{
        app.on("error",(err)=>{
            console.log("Error in connection:",err)
        })
        app.listen(process.env.PORT || 8000,()=>{
            console.log(`app is running on port :${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("Error:", err)
    })













// import express from "express"
// const app = express();

// (async ()=>{
// try {
//   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
//   app.on("error",(error)=>{
// console.log("Err:",error);
// throw error
//   })
//   app.listen(process.env.PORT,()=>{
//    console.log(`app is listing on port ${process.env.PORT}`)
//   })
// } catch (error) {
//    console.error("Error:",error)
//    throw err
// }

// })()