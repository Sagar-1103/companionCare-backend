import grpc from "@grpc/grpc-js";
import { Geo } from "./models/geo.model.js";

const setFallStatus = async(call,cb)=>{
    try {
        const {patientId,fallDetectionStatus} = call.request;
        if(!patientId){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const changedGeo = await Geo.findOneAndUpdate({patientId},{fallDetectionStatus},{new:true});
        if(!changedGeo){
             return cb({
                code: grpc.status.NOT_FOUND,
                message: "Couldnt change the fall detection status.",
            },null);
        }
        return cb(null, {
            message: "Changed fall detection status successfully.",
            geo:changedGeo,
        });
    } catch (error) {
        console.error("Error setting medication reminder:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {setFallStatus};