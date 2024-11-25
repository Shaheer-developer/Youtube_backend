import asynchandler from "../utils/asynchandler.js"
import { Apierrors } from "../utils/apierror.js"
import { User } from "../models/user.model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import { response } from "express";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })
        return { accesstoken, refreshtoken }

    } catch (error) {
        throw new Apierrors(500, "something went wrong")
    }
}


const registerUser = asynchandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty - correct format
    // check if user already exists :username and email
    //check for images , check for avatar
    // upload them to cloudinary
    //create user object - create entry in db
    // remove password and refresh token field from response
    //check for user creation 
    // return response

    const { fullname, email, username, password } = req.body
    // console.log("email:",email);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new Error(400, "All fields required");
    }


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })


    if (existedUser) {
        throw new Apierrors(409, "User with email or username already existed")
    }


    const avatarlocalpath = req.files?.avatar[0]?.path;
    // const coverImagelocalpath=req.files?.coverImage[0]?.path;

    let coverImagelocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagelocalpath = req.files.coverImage[0].path;
    }



    if (!avatarlocalpath) {
        throw new Apierrors(400, "Avatar file is required");
    }


    const avatar = await uploadOncloudinary(avatarlocalpath)
    const coverImage = await uploadOncloudinary(coverImagelocalpath)

    if (!avatar) {
        throw new Apierrors(400, "Avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )


    if (!createdUser) {
        throw new Apierrors(500, "something went wrong while registering the user")
    }


    return res.status(201).json(
        new Apiresponse(201, createdUser, "User registered successfully")
    )

})

const login_user = asynchandler(async (req, res) => {
    //data from req body
    //username or email
    //find the user in the database
    //password check 
    //generate access and refresh token 
    //send cookies
    const { email, username, password } = req.body
    if (!(email || username)) {
        throw new Apierrors(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new Apierrors(404, "User does not exist")
    }
    const ispasswordvalid = await user.isPasswordCorrect(password)
    if (!ispasswordvalid) {
        throw new Apierrors(401, "Password incorrect")
    }
    const { accesstoken, refreshtoken } = await generateAccessAndRefreshTokens(user._id)

    const loggedinuser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accesstoken", accesstoken, options).cookie("refreshtoken", refreshtoken, options).json(
        new Apiresponse(200, { user: loggedinuser, accesstoken, refreshtoken }, "Logged In successfully")
    )

})

const logoutuser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshtoken: undefined
        }
    },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accesstoken", options).clearCookie("refreshtoken", options).json(
        new Apiresponse(200, {}, "logged out successfully")
    )

})

const refreshaccesstoken = asynchandler(async (req, res) => {
    const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken
    if (!incomingrefreshtoken) {
        throw new Apierrors(401, "Unauthorized request");
    }
    try {
        const decodedtoken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedtoken?._id)
        if (!user) {
            throw new Apierrors(401, "Invalid refresh Token")
        }
        if (incomingrefreshtoken !== user?.refreshtoken) {
            throw new Apierrors(401, "Refresh Token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accesstoken, newrefreshtoken } = await generateAccessAndRefreshTokens(user._id)

        res.status(200).cookie("accesstoken", accesstoken, options).cookie("refreshtoken", newrefreshtoken, options).json(
            new Apiresponse(200, { accesstoken, refreshtoken: newrefreshtoken }, "access token refreshed successfully")
        )
    } catch (error) {
        throw new Apierrors(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asynchandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new Apierrors(400, "Invalid password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return response.status(200).json(
        new Apiresponse(200, {}, "Password changed successfully")
    )

})

const getCurrentuser = asynchandler(async (req, res) => {
    return res.status(200).json(
        new Apiresponse(200, req.user, "current user fetched successfully")
    )
})

const changecurrentdetails = asynchandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new Apierrors(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200).json(
        new Apiresponse(200, user, "Account details updated successfully")
    )

})

const updateavatar = asynchandler(async (req, res) => {

    const avatarlocalpath = req.file?.path

    if (!avatarlocalpath) {
        throw new Apierrors(400, "Avatar file is missing");
    }
    const avatar = await uploadOncloudinary(avatarlocalpath)
    if (!avatar.url) {
        throw new Apierrors(400, "error while uploading avatar");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { avatar: avatar.url }
        },
        {
            new: true
        }
    ).select("-passowrd")

    res.status(200).json(
        new Apiresponse(200, user, "Avatar Image updated successfully")
    )

})
const updatecover = asynchandler(async (req, res) => {

    const coverlocalpath = req.file?.path

    if (!coverlocalpath) {
        throw new Apierrors(400, "Cover Image file is missing");
    }
    const coverImage = await uploadOncloudinary(coverlocalpath)
    if (!coverImage.url) {
        throw new Apierrors(400, "error while uploading coverImage");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { coverImage: coverImage.url }
        },
        {
            new: true
        }
    ).select("-passowrd")

    res.status(200).json(
        new Apiresponse(200, user, "Cover Image updated successfully")
    )

})

const getuserchannelprofiel = asynchandler(async (req, res) => {
    const { username } = req.params
    if (!username.trim()) {
        throw new Apierrors(400, "username is missing")
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subcribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribercount: {
                    $size: "$subscribers"
                },
                subscribedtocount: {
                    $size: "$subscribedTo"
                },
                issubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }

        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribercount:1,
                subscribedTo:1,
                issubscribed:1,
                avatar:1, 
                coverImage:1,
                email:1
            }
        }

    ]
    )
if(!channel?.length){
    throw new Apierrors(404 , "channel does not exist");
}

return res.status(200).json(
    new Apiresponse(200 , channel[0], "Users channel fetched successfully")
)
})



export {
    registerUser
    , login_user,
    logoutuser,
    refreshaccesstoken,
    changeCurrentPassword,
    getCurrentuser,
    changecurrentdetails,
    updateavatar,
    updatecover
}