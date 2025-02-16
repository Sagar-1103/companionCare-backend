import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = ()=>{
    try {
        const connect = cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          })
        console.log(`Connected to cloudinary: ${connect.cloud_name}`);
    } catch (error) {
        console.log("Error while connecting to cloudinary.");
    }
    
}

export {connectCloudinary}