import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { Apierrors } from "../utils/apierror.js"
import { Apiresponse } from "../utils/Apiresponse.js"
import { asynchandler } from "../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (!content) {
        throw new Apierrors(400, "No content found")
    }
    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })
    if (!tweet) {
        throw new Apierrors(500, "Error while creating tweet")
    }
    return res.status(200).json(
        new Apiresponse(200, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asynchandler(async (req, res) => {
    // TODO: get user tweets
    const gettweets = await Tweet.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            fullname: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                owner: 1,
                content: 1
            }
        }
    ])
    if (gettweets.length === 0) {
        throw new Apierrors(404, "No tweets found")
    }
    if (!gettweets) {
        throw new Apierrors(500, "Error while fetching user tweets")
    }
    return res.status(200).json(
        new Apiresponse(200, gettweets, "Tweets fetched successfully")
    )
})

const updateTweet = asynchandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body
    const { tweetId } = req.params
    if(!isValidObjectId(tweetId)){
        throw new Apierrors(400 , "Invalid Tweet Id")
    }
    if (!content) {
        throw new Apierrors(404, "No content found")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new Apierrors(404, "No tweet found")
    }
    if(tweet.owner !== req.user._id){
        throw new Apierrors(403 , "You are not allowed to perform this operation")
    }
    const updateTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: {
                content,
            }
        },
        {
            new: true
        }
    )
    if (!updateTweet) {
        throw new Apierrors(500, "Error while updating tweet")
    }
    return res.status(200).json(
        new Apiresponse(200, updateTweet, "Tweet updated successfully")
    )
})

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new Apierrors(400 , "Invalid Tweet Id")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new Apierrors(404 , "Tweet not found")
    }
    if(tweet.owner !== req.user._id){
        throw new Apierrors(403 , "You are not allowed to perform this operation")
    }
    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deleteTweet){
        throw new Apierrors(500 , "Error while deleting Tweet")
    }
    return res.status(200).json(
        new Apiresponse(200 , deleteTweet , "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}