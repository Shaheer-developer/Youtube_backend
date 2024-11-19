import  asynchandler  from "../utils/asynchandler ";
import { Apierrors } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"

const verifyJwt = asynchandler(async(req, _ ,next) => {
try {
    const token = req.cookies?.accesstoken  || req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new Apierrors(401 , "Unauthorized request");
    }
    const decodedtoken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedtoken?._id).select("-password -refreshtoken")
    if (!user){
        throw new Apierrors(401 , "Invalid Access Token");
    }
    req.user = user;
    next()
} catch (error) {
    throw new Apierrors(401 , error?.message || "Invalid Access Token");
    
}
})
export {verifyJwt}