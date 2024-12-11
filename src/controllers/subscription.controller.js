import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {Apierrors} from "../utils/apierror.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import asynchandler from "../utils/asynchandler.js"


const toggleSubscription = asynchandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new Apierrors(400 , "Channel Id is not valid")
    }
    const subscribed = await Subscription.findOne(
        {
            $and:[{channel:channelId} , {subscriber:req.user._id}]
        }
    )
    if(!subscribed){
        const subscribe = await Subscription.create(
            {
                subscriber : req.user._id,
                channel: channelId,
            }
        )
        if(!subscribe){
            throw new Apierrors(500 , "Error while subscribing")
        }
        return res.status(200).json(
            new Apiresponse(200 , subscribe , "Subscribed successfully")
        )
    }
    const unsubscribe = await Subscription.findByIdAndDelete(subscribed._id)
    if(!unsubscribe){
        throw new Apierrors(500 , "Error while unsubscribing");
    }
    return res.status(200).json(
        new Apiresponse(200 , {} , "Unsubscribed successfully")
    )

})



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new Apierrors(400 , "Invalid Channel Id");
    }
    
    const Subscriberslist = await Subscription.aggregate([
        {
            $match:{
                channel:mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscribers:{
                    $first: "$subscribers",
                }
            }
        },
        {
            $project:{
                subscriber:1,
                createdAt:1,
            }
        }
    ])
    if(!Subscriberslist){
        throw new Apierrors(500 , "Error while fetching Subscribers list")
    }
    return res.status(200).json(
        new Apiresponse(200 , Subscriberslist , "Subscribers List fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new Apierrors(400 , "Invalid subscriber Id")
    }
    const subscribedToList = await Subscription.aggregate([
        {
            $match:{
                subscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedTo",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1, 
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscribedTo:{
                    $first:"$subscribedTo"
                }
            }
        },
        {
            $project:{
                subscriberTo:1,
                createdAt:1
        }
    }
    ])
    if(!subscribedToList){
        throw new Apierrors(500 , "Error while fetching Subscribed Channels List")
    }
    return res.status(200).json(
        new Apiresponse(200 , subscribedToList , "Subscribed Channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}