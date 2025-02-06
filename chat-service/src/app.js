import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";
import { Room } from "./models/room.model.js";
import { Chat } from "./models/chat.model.js";
dotenv.config();

const createRoom = async(call,cb)=>{
    try {
        const { user1Id, user2Id } = call.request;
        if(!user1Id || !user2Id) {
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const createdRoom = await Room.create({user1Id,user2Id});
        if(!createdRoom){
            return cb({
                code: grpc.status.INTERNAL,
                message: "Error creating room.",
            },null);
        }
        return cb(null, { 
            room:createdRoom,
            message:"Room created for both the users."
            });
    } catch (error) {
        console.error("Error creating room:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const getChats = async(call,cb)=>{
    try {
        const {roomId} = call.request;
        
        if(!roomId){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }

        const chats = await Chat.find({roomId});
        
        if(!chats){
            return cb({
                code: grpc.status.INTERNAL,
                message: "Error fetching chats.",
            },null);
        }
        return cb(null, { 
            chats,
            message:"Fetched all the chats of the room."
            });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {createRoom,getChats};