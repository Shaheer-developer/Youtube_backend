import mongoose from "mongoose";
import { DB_name } from "../constants.js";

const connect_db=async()=>{
    try {
      const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
      console.log(`Mongo DB connected DB host:${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error:",error);
        process.exit(1)
        
    }
}
export default connect_db