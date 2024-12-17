import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Apierrors} from "../utils/apierror.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import { Video } from "../models/video.model.js";

const getVideoComments = asynchandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId){
        throw new Apierrors(400 , "Invalid video Id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new Apierrors(400 , "Video not found")
    }

    const options = {
        page , 
        limit ,
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"createdBy",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1,
                        }
                    }

                ]
            }
        },
        {
            $addFields:{
                createdBy:{
                    $first:"$createdBy"
                }
            }
        },
        {
            $project:{
                content:1,
                createdBy:1
            }
        },
        {
            $unwind:"$createdBy"
        },
        {
            $skip:(page-1)*limit,
        },
        {
        $limit:parseInt(limit)
        }
    ])

return res.status(200).json(
    new Apiresponse(200 , comments , "Comments fetched successfully")
)


})

const addComment = asynchandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if(!videoId){
        throw new Apierrors(400 , "Video not found")
    }
    if(!content){
        throw new Apierrors(400 , "No content for the comment")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new Apierrors(400 , "No video found")
    }
    const comment = await Comment.create({
        content,
        owner: req.user._id,
        video:videoId
    })
    if(!comment){
        throw new Apierrors(500 , "Error while posting comment")
    }

    return res.status(200).json(
        new Apiresponse(200 , comment , "Comment added successfully")
    )
})

const updateComment = asynchandler(async (req, res) => {
    // TODO: update a comment
   const {commentId} = req.params
   const {content} = req.body
   if(!commentId){
    throw new Apierrors(400 , "Commnet Id not found")
   }
   if(!content){
    throw new Apierrors(400 , "No content for comment")
   }
   const comment = await Comment.findById(commentId)
   if(!comment){
    throw new Apierrors(404 , "No comment found")
   }
   if(comment.owner !== req.user._id){
    throw new Apierrors(403 , "You are not allowed to modify this comment")
   }
   const updateComment = await Comment.findByIdAndUpdate(
    commentId,
   {
     $set:{
        content
    }
},
    {
        new:true,
    }
   )
   if(!updateComment){
    throw new Apierrors(500 , "Error while updating comment")
   }
   return res.status(200).json(
    new Apiresponse(200 , updateComment , "Comment updated successfully")
   )

})

const deleteComment = asynchandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId){
        throw new Apierrors(400 , "Comment Id not found")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new Apierrors(404 , "No commnet found")
    }
    if(comment.owner !== req.user._id){
        throw new Apierrors(403 , "You are not allowed to delete this comment")
    }
    const deletecomment = await Comment.findByIdAndDelete(commentId)
    if(!deleteComment){
        throw new Apierrors(500 , "Error while deleting comment")
    }
    return res.status(200).json(
        new Apiresponse(200 , deleteComment , "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }