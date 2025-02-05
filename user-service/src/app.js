import { User } from "./models/user.model.js";
import {Caretaker} from "./models/caretaker.model.js";
import {Doctor} from "./models/doctor.model.js";
import {Patient} from "./models/patient.model.js";
import grpc from "@grpc/grpc-js";

const createUser = async(call,cb)=>{
    try {
    const {name,email,password,phNo,gender,dob,role} = call.request.user;
    console.log(name,email,password,phNo,gender,dob,role);

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



export {createUser};

