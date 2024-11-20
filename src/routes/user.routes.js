import { Router } from "express";
import { registerUser , login_user, logoutuser , refreshaccesstoken } from "../controllers/user.controller.js";
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
export default router