import { User } from "./models/user.model.js";
import {Doctor} from "./models/doctor.model.js";
import {Patient} from "./models/patient.model.js";
import grpc from "@grpc/grpc-js";
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

const createDoctor = async(call,cb)=>{
    try {
    const {email,password,role,phNo,name} = call.request;
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
    let user;
    if (!createdUser) {
        return cb({
            code: grpc.status.INTERNAL,
            message: "Failed to create user.",
        },null);
    }
        const createdDoctor = await Doctor.create({doctorId:createdUser._id,name});
        if (!createdDoctor) {
            return cb({
                code: grpc.status.INTERNAL,
                message: "Failed to create doctor.",
            },null);
        }
        createdUser.password = undefined;
        createdUser.name = name;
        user = createdUser;
    return cb(null, {
        message: "User created successfully.",
        doctor:user
    });
    } catch (error) {
        console.error("Error in createUser:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}


const createDoctorToken = async(call,cb)=>{
    try {
        let {email,password} = call.request;
            if(!email || !password) {
                return cb({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: "Missing required fields.",
                },null);
            }

            let loggedUser = await User.findOne({email});
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
            const fetchedUser = await Doctor.findOne({doctorId:loggedUser._id});
            tempUser.patients = fetchedUser.patients;
            tempUser.name = fetchedUser.name
            
            await loggedUser.save({ validateBeforeSave: "false" });
            tempUser.password = undefined;
            return cb(null, {
                message: "Access and refresh tokens generated",
                doctor:tempUser,
                refreshToken,
                accessToken
            });
    } catch (error) {
        console.error("Error in createUser:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const getCurrentDoctor = async(call,cb)=>{
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
        const fetchedCaretaker = await Doctor.findOne({doctorId:fetchedUser._id});
        tempUser.patients = fetchedCaretaker.patients;
        tempUser.name = fetchedCaretaker.name;
        return cb(null, {
            message: "Current user fetched successfully.",
            doctor:tempUser,
        });
    } catch (error) {
        console.error("Error in creating getting caretaker:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const pairPatient = async(call,cb)=>{
    try {
        const {code,doctorId} = call.request;
        if(!code || !doctorId){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "No user found",
            },null);
        }
        const fetchedPatient =  await Patient.findOneAndUpdate({code},{doctorId},{new:true});
        if (!fetchedPatient) {
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Patient not found.",
            }, null);
        }
        const updatedDoctor = await Doctor.findOne({doctorId});
        if (!updatedDoctor) {
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Doctor not found.",
            }, null);
        }
        const createRoomRequest = {
            user1Id:fetchedPatient._id._id,user2Id:doctorId
          };
        chatClient.createRoom(createRoomRequest,async(err,msg)=>{
            if(err){
                return cb({
                    code: grpc.status.INTERNAL,
                    message: "Failed to create room.",
                },null);
            }
            await Patient.findByIdAndUpdate(fetchedPatient._id,{doctorId,"roomIds.doctorRoomId": msg.room.id})
            await Doctor.findOneAndUpdate(
                {doctorId},
                {
                    $addToSet: {
                        patients: {
                            patientId: fetchedPatient._id,
                            code: fetchedPatient.code,
                            roomId:msg.room.id,
                        },
                    },
                }
            );
        })
        return cb(null, {
            message: "Doctor paired with patient successfully.",
            patient:fetchedPatient,
        });
    } catch (error) {
        console.error("Error pairing doctor:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {createDoctor,createDoctorToken,getCurrentDoctor,pairPatient};

