import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDatabase = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Failed : ",error);
        process.exit(1)
    }
}

export default connectDatabase;