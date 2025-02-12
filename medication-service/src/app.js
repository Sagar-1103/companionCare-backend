import grpc from "@grpc/grpc-js";
import dotenv from "dotenv";
import { Time } from "./models/time.model.js";
import { Medication } from "./models/medication.model.js";
import { Health } from "./models/health.model.js";
dotenv.config();

const setTime = async(call,cb) =>{
    try {
        const {patientId,breakfast,lunch,snacks,dinner} = call.request;
        if(!patientId || !breakfast || !lunch || !snacks || !dinner){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const timings = {breakfast,lunch,snacks,dinner};

        const existingTime = await Time.findOne({ patientId });

        if (existingTime) {
            existingTime.timings = timings;
            await existingTime.save();
            return cb(null, {
                message: "Time slots updated successfully.",
                time: existingTime,
            });
        }
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
        const {patientId,medicineName,medicineType,medicineDosage,timing,medText,startDate,endDate,before,after} = call.request;
        if(!patientId || !medicineName || !medicineType || !medicineDosage || !timing || !medText || !startDate || !endDate){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const fetchedTime = await Time.findOne({patientId});
        let timer;
        if (timing==="breakfast") {
            timer  = fetchedTime.timings.breakfast;
        }
        if (timing==="lunch") {
            timer  = fetchedTime.timings.lunch;
        }
        if (timing==="snacks") {
            timer  = fetchedTime.timings.snacks;
        }
        if (timing==="dinner") {
            timer  = fetchedTime.timings.dinner;
        }
        
        const createdMedication = await Medication.create({patientId,medicineName,medicineType,medicineDosage,timing:timer,medText,startDate,endDate,before,after});
        if(!createdMedication){
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Couldnt create medication.",
            },null);
        }
        return cb(null, {
            message: "Setting medication done successfully.",
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
            message: "Deleting mediation done successfully.",
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
            message: "Fetched all mediations successfully.",
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

const setHealthDetails = async(call,cb)=>{
    try {
        const {patientId,date,heartRate,bloodPressure,bodyTemperature,bloodSugar,spo2,sleep,steps} = call.request.health;
        if(!patientId || !date || !heartRate || !bloodPressure || !bodyTemperature || !bloodSugar || !spo2 || !sleep || !steps){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const formattedDate = new Date(date).toISOString().split("T")[0];
        let healthEntry = await Health.findOne({ patientId, date: formattedDate });
        if (healthEntry) {
            healthEntry.heartRate = heartRate;
            healthEntry.bloodPressure = bloodPressure;
            healthEntry.bodyTemperature = bodyTemperature;
            healthEntry.bloodSugar = bloodSugar;
            healthEntry.spo2 = spo2;
            healthEntry.sleep = sleep;
            healthEntry.steps = steps;
        } else {
            healthEntry = new Health({
                patientId,
                date: formattedDate,
                heartRate,
                bloodPressure,
                bodyTemperature,
                bloodSugar,
                spo2,
                sleep,
                steps
            });
        }
        await healthEntry.save();
        return cb(null, {
            message: "Health details set successfully.",
            health:healthEntry,
        });
    } catch (error) {
        console.error("Error setting health details:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const getHealthDetails = async(call,cb)=>{
    try {
        const {patientId,date} = call.request;
        if(!patientId || !date){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const formattedDate = new Date(date).toISOString().split("T")[0];
        const healthEntry = await Health.findOne({ patientId, date: formattedDate });
        if(!healthEntry){
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Couldnt find the health detail for the given date.",
            },null);
        }
        return cb(null, {
            message: "Health details fetched successfully.",
            health:healthEntry,
        });
    } catch (error) {
        console.error("Error setting health details:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {setTime,setMedication,deleteMedication,getMedications,setHealthDetails,getHealthDetails};