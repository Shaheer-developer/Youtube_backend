import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

const uploadOncloudinary=async(localfilepath)=>{
    try {
        if(!localfilepath) return null;
       const response=await cloudinary.uploader.upload(localfilepath,{resource_type:"auto"} )

        // console.log("file is uploaded in cloudinary",response.url)
        fs.unlinkSync(localfilepath)
        return response;

    } 
    catch (error) {
        fs.unlinkSync(localfilepath)
        return null;
    }

}

const deletefromcloudinary= async(cloudinaryfilepath)=>{
  try {
      if(!cloudinaryfilepath) return null
      const publicId = cloudinaryfilepath.split('/').slice(-2).join('/').split('.')[0];
  
      const result = await cloudinary.uploader.destroy(publicId)
      return result;
  } catch (error) {
    return null
  }
}
export {uploadOncloudinary, deletefromcloudinary}



// const uploadResult = await cloudinary.uploader
//         .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                 public_id: 'shoes',
//            }        )
//        .catch((error) => {
//            console.log(error);
//       });
    
//      console.log(uploadResult);






// (async function() {

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//         api_key: process.env.CLOUDINARY_API_KEY, 
//         api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
//     });
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();