import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Apierrors} from "../utils/apierror.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const toggleVideoLike = asynchandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new Apierrors(400 , "Invalid video Id")
    }
    const liked = await Like.findOne(
        {
            $and:[{video:videoId} , {likedBy:req.user._id}]
        }
    )
    if(!liked){
        const like = await Like.create({
            video:videoId,
            likedBy:req.user._id
        })
        if(!like){
            throw new Apierrors(500 , "Error while liking this video")
        }
        return res.status(200).json(
            new Apiresponse(200 , like , "Successfully liked the video")
        )
    }
    const unlike = await Like.findByIdAndDelete(liked._id)
    if(!unlike){
        throw new Apierrors(500 , "Error while unliking the video")
    }
    return res.status(200).json(
        new Apiresponse(200 , {} , "Video unliked successfully")
    )
})

const toggleCommentLike = asynchandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new Apierrors(400 , "Invalid Comment Id")
    }
    const commentliked = await Like.findOne({
        $and:[{comment : commentId} , {likedBy:req.user._id}]
    })
    if(!commentliked){
        const likeComment = await Like.create({
            comment:commentId,
            likedBy:req.user._id
        })
        if(!likeComment){
            throw new Apierrors(500 , "Error while liking comment")
        }
        return res.status(200).json(
            new Apiresponse(200 , likeComment , "Comment liked successfully")
        )
    }
const unlikecomment = await Like.findByIdAndDelete(commentliked._id)
if(!unlikecomment){
    throw new Apierrors(500 , "Error while unliking the comment")
}
return res.status(200).json(
    new Apiresponse(200 , {} , "Comment unliked successfully")
)
})

const toggleTweetLike = asynchandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new Apierrors(400 , "Invalid tweet Id")
    }
    const tweetliked = await Like.findOne({
        $and:[{tweet : tweetId} , {likedBy: req.user._id}]
    })
    if(!tweetliked){
        const liketweet = await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })
        if(!liketweet){
            throw new Apierrors(500 , "Error while liking the tweeet")
        }
        return res.status(200).json(
            new Apiresponse(200 , liketweet , "Successfully liked the tweet")
        )
    }
    const unliketweet = await Like.findByIdAndDelete(tweetId)
    if(!unliketweet){
        throw new Apierrors(500 , "Error while unliking the tweet")
    }
    return res.status(200).json(
        new Apiresponse(200 , {} , "Successfully unliked the tweet")
    )
}
)

const getLikedVideos = asynchandler(async (req, res) => {
    //TODO: get all liked videos
    const likedvideos = await Like.aggregate([
        {
            $match:{
                likedBy:mongoose.Types.ObjectId(req.user._id),
                video:{$exists: true , $ne : null}
            }
        },
        {
            $lookup:{
                from :"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        avatar:1,
                                        username:1,
                                        fullname:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first : "$owner"
                            }
                        }
                    },
                    {
                        $project:{
                            owner:1,
                            thumbnail:1,
                            title:1,
                            duration:1,
                            views:1,
                            videofile:1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video",
        },
        {
            $project:{
                video:1,
                likedBy:1
            }
        }
    ])
    if(!likedvideos){
        throw new Apierrors(500 , "Error while getting liked videos")
    }
    return res.status(200).json(
        new Apiresponse(200 , likedvideos , "Successfully fetched all liked videos")
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}