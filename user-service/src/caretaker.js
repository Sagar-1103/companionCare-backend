import { User } from "./models/user.model.js";
import {Caretaker} from "./models/caretaker.model.js";
import {Patient} from "./models/patient.model.js";
import grpc from "@grpc/grpc-js";
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
    const {name,email,password,role,phNo} = call.request;
    console.log(name,email,password,role,phNo);
    
    if(!email || !password || !role || !phNo || !name) {
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
    if (!createdUser) {
        return cb({
            code: grpc.status.INTERNAL,
            message: "Failed to create user.",
        },null);
    }
    const createdCaretaker = await Caretaker.create({caretakerId:createdUser._id,name});
    if (!createdCaretaker) {
        return cb({
            code: grpc.status.INTERNAL,
            message: "Failed to create caretaker.",
        },null);
    }
    
    const accessToken = createdUser.generateAccessToken();
    const refreshToken = createdUser.generateRefreshToken();
    if(!accessToken || !refreshToken) {
        return cb({
            code: grpc.status.INTERNAL,
            message: "Failed to generate tokens.",
        },null);
    }
    createdUser.refreshToken = refreshToken;

    let tempUser = createdUser;
    const fetchedUser = await Caretaker.findOne({caretakerId:createdUser._id});
    tempUser.code = fetchedUser.code;
    tempUser.patientId = fetchedUser.patientId;
    tempUser.caretakerId = fetchedUser.caretakerId;
    tempUser.roomId = fetchedUser.roomId;
    tempUser.name = fetchedUser.name;
    
    await createdUser.save({ validateBeforeSave: "false" });
    tempUser.password = undefined;
    return cb(null, {
        message: "Access and refresh tokens generated",
        caretaker:tempUser,
        refreshToken,
        accessToken
    });
    } catch (error) {
        console.error("Error in creating caretaker:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const createPatientByCaretaker = async(call,cb)=>{
    try {
    const {name,email,dob,gender,caretakerId,role,phNo} = call.request;
    if(!name || !email || !dob || !gender || !caretakerId || !role || !phNo) {
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
    const password = "1232345234";
    const createdUser = await User.create({email,password,role,phNo});
    let user;
    if (!createdUser) {
        return cb({
            code: grpc.status.INTERNAL,
            message: "Failed to create user.",
        },null);
    }
        const genCode = uuidv4();
        const createdPatient = await Patient.create({patientId:createdUser._id,name,gender,dob,code:genCode.slice(0,6)});
        if (!createdPatient) {
            return cb({
                code: grpc.status.INTERNAL,
                message: "Failed to create patient.",
            },null);
        }
        if(caretakerId){
            
            const createRoomRequest = {
                user1Id:createdUser._id,user2Id:caretakerId
              };
            chatClient.createRoom(createRoomRequest,async(err,msg)=>{
                if(err){
                    return cb({
                        code: grpc.status.INTERNAL,
                        message: "Failed to create room.",
                    },null);
                }
                await Patient.findByIdAndUpdate(createdPatient._id,{caretakerId,"roomIds.caretakerRoomId": msg.room.id})
                await Caretaker.findOneAndUpdate({caretakerId},{code:genCode.slice(0,6),patientId:createdUser._id,roomId:msg.room.id});
            })
        }
        const res = {
            id:createdUser._id,
            name:createdPatient.name ,
            email:createdUser.email ,
            password:undefined ,
            role:createdUser.role ,
            phNo:createdUser.phNo ,
            dob:createdPatient.dob ,
            gender:createdPatient.gender,
            code:createdPatient.code,
            caretakerId
        }
        user = res;
    return cb(null, {
        message: "User created successfully.",
        patient:user
    });
    } catch (error) {
        console.error("Error in creating patient by user:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}


const createCaretakerToken = async(call,cb)=>{
    try {
        let {email,password} = call.request;
            if(!email || !password) {
                return cb({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: "Missing required fields.",
                },null);
            }

            let loggedUser = await User.findOne({email});
            if(!loggedUser){
                return cb({
                    code: grpc.status.NOT_FOUND,
                    message: "Caretaker Not Found",
                },null);
            }
            const isPasswordValid = await loggedUser.isPasswordCorrect(password);
            if (!isPasswordValid) {
                return cb({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: "Incorrect Credentials",
                },null);
            }
            const accessToken = loggedUser.generateAccessToken();
            const refreshToken = loggedUser.generateRefreshToken();
            if(!accessToken || !refreshToken) {
                return cb({
                    code: grpc.status.INTERNAL,
                    message: "Failed to generate tokens.",
                },null);
            }
            loggedUser.refreshToken = refreshToken;

            let tempUser = loggedUser;
            const fetchedUser = await Caretaker.findOne({caretakerId:loggedUser._id});
            tempUser.code = fetchedUser.code;
            tempUser.patientId = fetchedUser.patientId;
            tempUser.caretakerId = fetchedUser.caretakerId;
            tempUser.roomId = fetchedUser.roomId;
            tempUser.name = fetchedUser.name;
            
            await loggedUser.save({ validateBeforeSave: "false" });
            tempUser.password = undefined;
            return cb(null, {
                message: "Access and refresh tokens generated",
                caretaker:tempUser,
                refreshToken,
                accessToken
            });
    } catch (error) {
        console.error("Error in creating caretaker:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const getCurrentCaretaker = async(call,cb)=>{
    try {
        const {id} = call.request;
        if(!id){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const fetchedUser = await User.findById(id);
        if(!fetchedUser){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "No user found",
            },null);
        }
        fetchedUser.password = undefined;
        let tempUser = fetchedUser;
        const fetchedCaretaker = await Caretaker.findOne({caretakerId:fetchedUser._id});
        tempUser.code = fetchedCaretaker.code;
        tempUser.patientId = fetchedCaretaker.patientId;
        tempUser.roomId = fetchedCaretaker.roomId;
        tempUser.name = fetchedCaretaker.name;
        return cb(null, {
            message: "Current user fetched successfully.",
            caretaker:tempUser,
        });
    } catch (error) {
        console.error("Error in creating getting caretaker:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}


export {createCaretaker,createPatientByCaretaker,createCaretakerToken,getCurrentCaretaker};