import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { Video } from "../models/user.model.js";
import { User } from "../models/user.model.js";
import {Apierrors} from "../utils/apierror.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import asynchandler from "../utils/asynchandler.js"

const createPlaylist = asynchandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name || !description){
        throw new Apierrors(400 , "both name and description are required")
    }
    const existingplaylist = await Playlist.findOne({
        $and:[{name:name},{owner:req.user?._id}]
    })
    if(existingplaylist){
        throw new Apierrors(400, "Playlist with this name already exists")
    }
    const playlist = await Playlist.create({
        name, 
        description,
        owner:req.user?._id
    })
    if(!playlist){
        throw new Apierrors(500 , "Playlist not created")
    }
    return res.status(200).json(
        new Apiresponse(200 , playlist , "Playlist created")
    )
})
const getUserPlaylists = asynchandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new Apierrors(400 , "User Id is not valid")
    }
    const userplaylist = await Playlist.aggregate([
        {
            $match:{owner: new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup:{
                from:"Video",
                localField:"videos",
                foreignField:"_id",
                as:"Videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"User",
                            localField:"owner",
                            foreignField:"_id",
                            as:"videoOwner",
                            pipeline:[
                                {
                                    $project:{
                                        avatar: 1,
                                        fullname: 1, 
                                        username : 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            videoOwner:{
                            $first: "$videoOwner",
                            }
                        }
                    },
                    {
                        $project:{
                            title:1 ,
                            description: 1,
                            thumbnail: 1,
                            videoOwner: 1,
                            duration: 1,
                            views: 1,
                        }
                    }
                ]
            }
        },
       
        {
            $lookup:{
                from: "User",
                localField:"owner",
                foreignField: "_id",
                as:"CreatedBy",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            fullname: 1,
                            avatar : 1,
                        }
                    }
                ]

            }
                },
                {
                    $addFields:{
                        createdBy:{
                        $first : "$CreatedBy"
                        }
                    }
                },
                {
                    $project:{
                        Videos: 1,
                        CreatedBy: 1,
                        name :1,
                        description: 1,
                    }
                }
    ])
    if(!userplaylist){
        throw new Apierrors(400 , "Playlist not found")
    }
    return res.status(200).json(
        new Apiresponse(200 , userplaylist , "Playlist found successfully")
    )

})
const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new Apierrors(400 , "Playlist Id is not valid")
    }
    const PlaylistData = await Playlist.aggregate([
        {
            $match:{_id : new mongoose.Types.ObjectId(playlistId)}
        },
        {
            $lookup:{
                from:"Video",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"User",
                            localField:"owner",
                            foreignField:"_id",
                            as:"videoOwner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            videoOwner:{
                                $first:"$videoOwner"
                            }
                        }
                    },
                    {
                        $project:{
                            thumbnail:1,
                            videoOwner:1,
                            title:1,
                            description:1,
                            duration:1,
                            views:1,
                            createdAt:1,
                            updatedAt:1,
                        }
                    }
                ]
            },

        },
        {
            $lookup:{
                from:"User",
                localField:"owner",
                foreignField:"_id",
                as:"CreatedBy",
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
                CreatedBy:{
                    $first:"$CreatedBy"
                }
            }
        },
        {
            $project:{
                videos:1,
                CreatedBy:1,
                name:1,
                description:1,
            }
        }
    ])

if(!PlaylistData){
        throw new Apierrors(404 , "Playlist not found")
    }

    return res.status(200).json(
        new Apiresponse(200 , PlaylistData , "Playlist fetched successfully")
    )
})
const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new Apierrors(400, "Invalid video or playlist Id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierrors(404 , "Playlist does not exist")
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new Apierrors(403 , "You cannot modify this playlist")
    }
   if(playlist.videos.some((video)=>video.toString() === videoId)){
    throw new Apierrors(400 , "video already exists in the playlist")
   }
    const videoaddedtoplaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $push:{
                videos:videoId
            }
        },
        {
            new:true
        }
    )
    if(!videoaddedtoplaylist){
        throw new Apierrors(500 , "Error while adding video to the playlist");
    }
    return res.status(200).json(
        new Apiresponse(200 , videoaddedtoplaylist , "Video added to the playlist successfully")
    )
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new Apierrors(400 , "Invalid playlist or video Id");
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierrors(404 , "playlist does not exist");   
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new Apierrors(403 , "You are not allowed to modify this playlist");
    }
    const videoexists = playlist.videos.some((video)=> video.toString() === videoId)
    if(!videoexists){
        throw new Apierrors(404 , "Video not found");
    }
    const videoremovedfromplaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{videos : videoId}
        },
        {
            new:true
        }
    )
    if(!videoremovedfromplaylist){
        throw new Apierrors(500 , "Error while removing video from the playlist");
    }
    return res.status(200).json(
        new Apiresponse(200 , videoremovedfromplaylist , "Video removed successfully")
    )

})
const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new Apierrors(400 , "Invalid Playlist Id");
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierrors(404 , "Playlist not found");
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new Apierrors(403 , "You are not allowed to modify this playlist");
    }
    const playlistdeleted = await Playlist.findByIdAndDelete(playlistId)
    if(!playlistdeleted){
        throw new Apierrors(500 , "Error while deleting playlist")
    }
    return res.status(200).json(
        new Apiresponse(200 , {} , "Playlist deleted successfully")
    )
})

const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new Apierrors(400 , "Playlist Id is not valid");
    }
    if(!name || name.trim() === ""){
        throw new Apierrors(400 , "Name required");
    }
    if(!description || description.trim() === ""){
        throw new Apierrors(400 , "Description required");
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new Apierrors(404 , "Playlist not found");
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new Apierrors(403 , "You are not allowed to modify this playlist");
    }
    const playlistUpdated = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:{
                name:name,
                description:description
            }
        },
        {
            new:true
        }
    )
    if(!playlistUpdated){
        throw new Apierrors(500 , "Error while updating playlist");
    }
    return res.status(200).json(
        new Apiresponse(200 , playlistUpdated , "Playlist Updated successfully")
    )
})
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}