import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { Apierrors } from "../utils/apierror.js"
import { Apiresponse } from "../utils/Apiresponse.js"
import asynchandler from "../utils/asynchandler"
import { uploadOncloudinary, deletefromcloudinary } from "../utils/cloudinary.js"


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.aggregate([
        {
            $match: {
                $or: [{ title: { $regrex: query, options: "i" } }, { description: { $regrex: query, options: "i" } }]
            }
        },
        {
            $lookup: {
                from: "User",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy"
            }
        },
        {
            $unwind: "$createdBy"
        },
        {
            $project: {
                title: 1,
                description: 1,
                videofile: 1,
                thumbnail: 1,
                createdBy: {
                    fullname: 1,
                    avatar: 1,
                    username: 1
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
        {
            $skip: (page - 1) = limit
        },
        {
            $limit: parseInt(limit)
        }

    ])
    return res.status(200).json(
        new Apiresponse(200, videos, "All videos are fetched successfully")
    )
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400,"Title and Description both are required")
    }
    const videofilelocalpath = req.files?.videoFile[0]?.path
    if (!videofilelocalpath) {
        throw new Apierrors(400 ,"video file local path not found");
    }
    const videoFile = await uploadOncloudinary(videofilelocalpath)
    if (!videoFile?.url) {
        throw new Apierrors(400,"Error while uploading video");
    }

    const thumbnaillocalpath = req.files?.thumbnail[0]?.path
    if (!thumbnaillocalpath) {
        throw new Apierrors(404,"Thumbnail local file path not found");
    }
    const thumbnailfile = await uploadOncloudinary(thumbnaillocalpath)
    if (!thumbnailfile) {
        throw new Apierrors(404,"Error while uploading video")
    }

    const video = await Video.create({
        videofile: videoFile?.url,
        thumbnail: thumbnailfile?.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })
    if (!video) {
        throw new Apierrors(500,"Error while publishing video")
    }
    return res.status(200).json(
        new Apiresponse(200, video, "Video publishesd")
    )
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new Apierrors("The video id is not valid");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new Apierrors(404,"Video not found");
    }
    return res.status(200).json(
        new Apiresponse(200, video, "Video found")
    )
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    const {title , description}= req.body
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new Apierrors(400,"Video Id is not valid")
    }

if(!title || !description){
    throw new Apierrors(400,"Title and description both are required");
}
const thumbnaillocalpath = req.files?.path
if(!thumbnaillocalpath){
    throw new Apierrors(400, "thumbanil local path not found");
}

const video = await Video.findById(videoId)
if (!video) {
    throw new Apierrors(404,"video not found")
}
if (!(video.owner === req.user?._id)) {
    throw new Apierrors(400,"you are not allowed to update this video")
}
const deleteoldthumbnail = await deletefromcloudinary(video.thumbnail)
if(deleteoldthumbnail.result !== "ok"){
    throw new Apierrors(400, "error deleting thumbnail from cloudinary");
}
const newthumbnail = await uploadOncloudinary(thumbnaillocalpath)
if(newthumbnail.response !== "ok"){
    throw new Apierrors(400 , "error while uploading new thumbnail")
}
const updateddata = await Video.findByIdAndUpdate(
    videoId,
    {
        $set:{
            title,
            description,
            thumbnail: newthumbnail?.url,
         },
         
    },
    {
        new:true
    }
)
return res.status(200).json(
    new Apiresponse(200, updateddata, "Details updated successfully")
)
})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new Apierrors(400,"video id is not valid")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new Apierrors(404,"video not found")
    }
    if (!(video.owner === req.user?._id)) {
        throw new Apierrors(400,"you are not allowed to delete this video")
    }
    const deletevideofile = await deletefromcloudinary(video.videofile)
    if (!deletevideofile) {
        throw new Apierrors(500,"error deleting video from cloudinary");
    }
    const deletethumbnailfile = await deletefromcloudinary(video.thumbnail)
    if (!deletethumbnailfile) {
        throw new Apierrors(500,"error deleting thumbnail from cloudinary");
    }
    const deletevideo = await Video.deleteOne(_id:videoId)
    if (!deletevideo) {
        throw new Apierrors(500,"Error while deleting video");
    }
    return res.status(200).json
        (new Apiresponse(
            200, {}, "Video deleted successfully"))

})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new Apierrors(400, "Video Id is not valid");
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new Apierrors(404 , "video not found");
    }
    if(video.owner !== req.user?._id){
        throw new Apierrors(400, "you are not allowed to edit this video publication status");
    } 
    const updatepublicationstatus = await Video.updateOne(_id:videoId,{
        $set:{
            isPublished: !video.isPublished
        }
    },{
        new:true,
    }
)

return res.status(200).json(
    new Apiresponse(200, updatepublicationstatus, "Publicatioon status updated successfully")
)
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}