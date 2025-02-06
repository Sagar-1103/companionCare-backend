import { User } from "./models/user.model.js";
import {Caretaker} from "./models/caretaker.model.js";
import {Doctor} from "./models/doctor.model.js";
import {Patient} from "./models/patient.model.js";
import grpc from "@grpc/grpc-js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const createUser = async(call,cb)=>{
    try {
    const {name,email,password,phNo,gender,dob,role} = call.request.user;
    if(!name || !email || !password || !phNo || !gender || !dob || !role) {
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

    const createdUser = await User.create({name,email,password,phNo,gender,dob,role});
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
    }
    if(role==="doctor"){
        const createdDoctor = await Doctor.create({doctorId:createdUser._id});
        if (!createdDoctor) {
            return cb({
                code: grpc.status.INTERNAL,
                message: "Failed to create doctor.",
            },null);
        }
    }
    if(role==="patient"){
        const createdPatient = await Patient.create({patientId:createdUser._id});
        if (!createdPatient) {
            return cb({
                code: grpc.status.INTERNAL,
                message: "Failed to create patient.",
            },null);
        }
    }
    return cb(null, {
        message: "User created successfully.",
        user:createdUser
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
    // const loggedUser = await User.findById(user._id);
    const loggedUser = await User.findOne({email:user.email});
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

    return cb(null, {
        message: "Access and refresh tokens generated",
        user:loggedUser,
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
        return cb(null, {
            message: "Current user fetched successfully.",
            user:fetchedUser,
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

