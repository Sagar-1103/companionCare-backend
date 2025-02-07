import { User } from "./models/user.model.js";
import {Caretaker} from "./models/caretaker.model.js";
import {Doctor} from "./models/doctor.model.js";
import {Patient} from "./models/patient.model.js";
import grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const createUser = async(call,cb)=>{
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
    if(role==="caretaker"){
        const createdCaretaker = await Caretaker.create({caretakerId:createdUser._id});
        if (!createdCaretaker) {
            return cb({
                code: grpc.status.INTERNAL,
                message: "Failed to create caretaker.",
            },null);
        }
        createdUser.password = undefined;
        user = createdUser;
    }
    if(role==="doctor"){
        const createdDoctor = await Doctor.create({doctorId:createdUser._id});
        if (!createdDoctor) {
            return cb({
                code: grpc.status.INTERNAL,
                message: "Failed to create doctor.",
            },null);
        }
        createdUser.password = undefined;
        user = createdUser;
    }
    if(role==="patient"){
        const {name,gender,dob,caretakerId} = call.request.user;
        
        if(!name || !gender || !dob) {
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields for patient.",
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
            await Patient.findByIdAndUpdate(createdPatient._id,{caretakerId})
            await Caretaker.findOneAndUpdate({caretakerId},{code:genCode.slice(0,6),patientId:createdUser._id});
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
    }
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

const createToken = async(call,cb)=>{
try {
    let user = call.request.user;
    if(!user) {
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: "Missing required fields.",
        },null);
    }
    let loggedUser
    if(!user.code){
        loggedUser = await User.findOne({email:user.email});
        if(!loggedUser) {
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "No user found.",
            },null);
        }
    
        const isPasswordValid = await loggedUser.isPasswordCorrect(user.password);
        if (!isPasswordValid) {
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Incorrect Credentials",
            },null);
        }
    }
    else {
        const temp = await Patient.findOne({code:user.code});
        loggedUser = await User.findById(temp.patientId);
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
    await loggedUser.save({ validateBeforeSave: "false" });
    
    let tempUser = loggedUser;
    if(loggedUser.role==="patient"){
        const fetchedUser = await Patient.findOne({patientId:loggedUser._id});
        tempUser.dob = fetchedUser.dob;
        tempUser.name = fetchedUser.name;
        tempUser.gender = fetchedUser.gender;
        tempUser.code = fetchedUser.code;
        tempUser.caretakerId = fetchedUser.caretakerId;
        tempUser.patientId = fetchedUser.patientId;
    }
    if(loggedUser.role==="caretaker"){
        const fetchedUser = await Caretaker.findOne({caretakerId:loggedUser._id});
        tempUser.code = fetchedUser.code;
        tempUser.patientId = fetchedUser.patientId;
        tempUser.caretakerId = fetchedUser.caretakerId;
    }

    return cb(null, {
        message: "Access and refresh tokens generated",
        user:tempUser,
        refreshToken,
        accessToken
    });

} catch (error) {
    console.error("Error creating token:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
}
}

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
        const user = call.request.user;
        const loggedOutUser = await User.findByIdAndUpdate(
            user.id,
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

const getCurrentUser = async(call,cb)=>{
    try {
        const id = call.request.id;
        if(!id) {
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
        fetchedUser.password = null;
        let tempUser = fetchedUser;
        if(fetchedUser.role==="patient"){
            const fetchedPatient = await Patient.findOne({patientId:fetchedUser._id});
            tempUser.dob = fetchedPatient.dob;
            tempUser.name = fetchedPatient.name;
            tempUser.gender = fetchedPatient.gender;
            tempUser.code = fetchedPatient.code;
            tempUser.caretakerId = fetchedPatient.caretakerId;
            tempUser.patientId = fetchedPatient.patientId;
        }
        if(fetchedUser.role==="caretaker"){
            const fetchedCaretaker = await Caretaker.findOne({caretakerId:fetchedUser._id});
            tempUser.code = fetchedCaretaker.code;
            tempUser.patientId = fetchedCaretaker.patientId;
        }
        
        return cb(null, {
            message: "Current user fetched successfully.",
            user:tempUser,
        });
    } catch (error) {
        console.error("Error getting user:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {createUser,createToken,isAuthenticated,logoutUser,getCurrentUser};

