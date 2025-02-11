import grpc from "@grpc/grpc-js";
import { Geo } from "./models/geo.model.js";

const getGeoDetails = async(call,cb)=>{
    try {
        const {patientId} = call.request;
        if(!patientId){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const foundGeo = await Geo.findOne({patientId});
        if(!foundGeo){
             return cb({
                code: grpc.status.NOT_FOUND,
                message: "Couldnt find geo details for the given patient.",
            },null);
        }
        return cb(null, {
            message: "Fetched geo details successfully.",
            geo:foundGeo,
        });
    } catch (error) {
        console.error("Error setting medication reminder:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {getGeoDetails};