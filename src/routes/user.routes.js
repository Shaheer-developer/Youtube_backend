import { Router } from "express";
import { registerUser , login_user, logoutuser , refreshaccesstoken, changeCurrentPassword, getCurrentuser, changecurrentdetails, updateavatar, updatecover, getuserchannelprofile, getwatchhistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
 upload.fields([
    {
        name:"avatar",
        maxCount:1,
    },
    {
        name:"coverImage",
        maxCount:1
    }
 ]),   
    registerUser

);

router.route("/login").post(login_user)

//secured routes
router.route("/logout").post(verifyJwt, logoutuser)

router.route("/refreshtoken").post(refreshaccesstoken)

router.route("/change-password").post(verifyJwt, changeCurrentPassword)

router.route("/current-user").get(verifyJwt, getCurrentuser)

router.route("/update-account-datils").patch(verifyJwt,changecurrentdetails)

router.route("/avatar").patch(verifyJwt, upload.single("avatar") , updateavatar)

router.route("/cover-image").patch(verifyJwt, upload.single("coverImage") , updatecover)

router.route("/c/:usernmae").get(verifyJwt, getuserchannelprofile)

router.route("/history").get(verifyJwt, getwatchhistory)

export default router