import { User } from "./models/user.model.js";
import {Caretaker} from "./models/caretaker.model.js";
import {Patient} from "./models/patient.model.js";
import grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import protoLoader from "@grpc/proto-loader";
import { v4 as uuidv4 } from 'uuid';
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

const createCaretaker = async(call,cb)=>{
    try {
    const {email,password,role,phNo} = call.request.user;
    if(!email || !password || !role || !phNo) {
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: "Missing required fields.",
        },null);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return cb({
            code: grpc.status.ALREADY_EXISTS,
            message: "User already exists.",
        },null);
    }

    const createdUser = await User.create({email,password,role,phNo});
    let user;
    if (!createdUser) {
        return cb({
            code: grpc.status.INTERNAL,
            message: "Failed to create user.",
        },null);
    }
    const createdCaretaker = await Caretaker.create({caretakerId:createdUser._id});
    if (!createdCaretaker) {
        return cb({
            code: grpc.status.INTERNAL,
            message: "Failed to create caretaker.",
        },null);
    }
    createdUser.password = undefined;
    user = createdUser;
    return cb(null, {
        message: "User created successfully.",
        user
    });
    } catch (error) {
        console.error("Error in createUser:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}


export {createCaretaker};