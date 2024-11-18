import asynchandler from "../utils/asynchandler.js"
import {Apierrors} from "../utils/apierror.js"
import { User} from "../models/user.model.js";
import {uploadOncloudinary} from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";



const registerUser = asynchandler (async(req,res)=>{
    //get user details from frontend
    //validation - not empty - correct format
    // check if user already exists :username and email
    //check for images , check for avatar
    // upload them to cloudinary
    //create user object - create entry in db
    // remove password and refresh token field from response
    //check for user creation 
    // return response

   const {fullname, email , username, password} = req.body
// console.log("email:",email);

if ([fullname,email,username,password].some((field)=>field?.trim()==="")) {
    throw new Error(400,"All fields required");
}


const existedUser= await User.findOne({
    $or:[{username}, {email}]
})


if(existedUser){
    throw new Apierrors(409, "User with email or username already existed")
}


const avatarlocalpath=req.files?.avatar[0]?.path;
// const coverImagelocalpath=req.files?.coverImage[0]?.path;

let coverImagelocalpath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImagelocalpath = req.files.coverImage[0].path;
}



if (!avatarlocalpath) {
    throw new Apierrors(400 , "Avatar file is required");
}


const avatar=await uploadOncloudinary(avatarlocalpath)
const coverImage=await uploadOncloudinary(coverImagelocalpath)

if(!avatar){
    throw new Apierrors(400 , "Avatar file is required");
}

const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
   username:username.toLowerCase()
})


const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
)


if(!createdUser){
    throw new Apierrors(500, "something went wrong while registering the user")
}


return res.status(201).json(
    new Apiresponse(201 , createdUser , "User registered successfully")
)

    })


export {registerUser}