import { User } from "./models/user.model.js";
import grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import protoLoader from "@grpc/proto-loader";
dotenv.config();

const chatProtoPath = "./protos/chat.proto";
const packageDefinition = protoLoader.loadSync(chatProtoPath, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const ChatService = grpc.loadPackageDefinition(packageDefinition).ChatService;
const chatClient = new ChatService(
  process.env.CHAT_SERVICE_PORT,
  grpc.credentials.createInsecure()
);

const isAuthenticated = async(call,cb)=>{
    try {
        const token = call.request.token;
    if(!token) {
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: "Missing required fields.",
        },null);
    }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: "Invalid Access Token",
        },null);
    }
    const response = {
        ok: true,
        user,
      };
      return cb(null, response);

    } catch (error) {
        console.error("Error creating token:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const logoutUser = async(call,cb)=>{
    try {
        const {id} = call.request;
        const loggedOutUser = await User.findByIdAndUpdate(
            id,
            {
                $unset: {
                    refreshToken: 1,
                },
            },
            { new: true }
        );
        if(!loggedOutUser){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "User not found.",
            },null);
        }
        const response = {
            message: "User logged out successfully",
          };
          return cb(null, response);
    } catch (error) {
        console.error("Error logging out user:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}


export {isAuthenticated,logoutUser};

