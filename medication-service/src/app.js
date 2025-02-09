import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";
import { Time } from "./models/time.model.js";
import { Medication } from "./models/medication.model.js";
dotenv.config();

const setTime = async(call,cb) =>{
    try {
        const {patientId,breakfast,lunch,dinner} = call.request;
        if(!patientId || !breakfast || !lunch || !dinner){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const timings = {breakfast,lunch,dinner};
        const createdTime = await Time.create({timings,patientId});
        if(!createdTime){
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Couldnt create time slots.",
            },null);
        }
        return cb(null, {
            message: "Time slots created for the patient successfully.",
            time:createdTime,
        });
    } catch (error) {
        console.error("Error setting times:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const setMedication = async(call,cb)=>{
    try {
        const {patientId,medicineName,medicineType,medicineDosage,timing,medText,startDate,endDate} = call.request;
        if(!patientId || !medicineName || !medicineType || !medicineDosage || !timing || !medText || !startDate || !endDate){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const createdMedication = await Medication.create({patientId,medicineName,medicineType,medicineDosage,timing,medText,startDate,endDate});
        if(!createdMedication){
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Couldnt create medication.",
            },null);
        }
        return cb(null, {
            message: "Setting medication done succesfully.",
            medication:createdMedication,
        });
    } catch (error) {
        console.error("Error setting medication reminder:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const deleteMedication = async(call,cb)=>{
    try {
        const {medicationId} = call.request;
        if(!medicationId){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const deletedMedication = await Medication.findByIdAndDelete(medicationId);
        if(!deletedMedication){
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Couldnt delete medication.",
            },null);
        }
        return cb(null, {
            message: "Deleting mediation done succesfully.",
            deletedMedication
        });
    } catch (error) {
        console.error("Error deleting medication reminder:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const getMedications = async(call,cb)=>{
    try {
        const {patientId} = call.request;
        if(!patientId){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const medications = await Medication.find({patientId});
        return cb(null, {
            message: "Fetched all mediations succesfully.",
            medications,
        });
    } catch (error) {
        console.error("Error fetching all medication reminders:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {setTime,setMedication,deleteMedication,getMedications};