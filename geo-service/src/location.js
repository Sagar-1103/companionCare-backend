import grpc from "@grpc/grpc-js";
import { Geo } from "./models/geo.model.js";

const setLocation = async(call,cb)=>{
    try {
        const {patientId,lon,lat,type} = call.request;
        if(!patientId || lon === undefined || lat === undefined || !type){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }
        const updateField = type === "home" 
    ? { homeLocation: { type: "Point", coordinates: lon !== undefined && lat !== undefined ? [lon, lat] : [] } } 
    : { patientLocation: { type: "Point", coordinates: [lon, lat] } };

        console.log(updateField);
        const updatedGeo = await Geo.findOneAndUpdate(
            {patientId},
            {$set: updateField},
            { new: true }
          );
        if(!updatedGeo){
            
            let createdGeo = await Geo.create({patientId,...updateField});
            if (!createdGeo) {
                return cb({
                    code: grpc.status.NOT_FOUND,
                    message: `Couldnt change the ${type === "home"?"":"patient"} location.`,
                },null);
            }
            return cb(null, {
                message: `Changed ${type === "home"?"":"patient"} location succesfully.`,
                geo:createdGeo,
            });
        }
        return cb(null, {
            message: `Changed ${type === "home"?"":"patient"} location succesfully.`,
            geo:updatedGeo,
        });
    } catch (error) {
        console.error("Error setting location:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const isPatientInSafeZone = async(call,cb)=>{
    try {
        const {patientId} = call.request;
        if(!patientId){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }

    const patient = await Geo.findOne({ patientId });
    if (!patient) {
        return cb({
            code: grpc.status.NOT_FOUND,
            message: "Patient not found.",
        },null);
    }
    const { homeLocation, patientLocation, radius } = patient;
    if (!homeLocation || !patientLocation) {
        return cb({
            code: grpc.status.NOT_FOUND,
            message: "Missing location or radius data.",
        },null);
      }
      const radiusInRadians = radius / 6378.1;
      const isInsideSafeZone = await Geo.findOne({
        patientId,
        patientLocation: {
          $geoWithin: {
            $centerSphere: [homeLocation.coordinates, radiusInRadians],
          },
        },
      });

      return cb(null, {
        message: "Patient safe zone status fetched succesfully.",
        isInsideSafeZone:!!isInsideSafeZone,
        });

    } catch (error) {
        console.error("Error getting patient safe zone status:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

const setRadius = async(call,cb)=>{
    try {
        const {patientId,radius} = call.request;
        if(!patientId || !radius){
            return cb({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Missing required fields.",
            },null);
        }

        const updatedGeo = await Geo.findOneAndUpdate({patientId},{radius},{new:true});
        if(!updatedGeo){
            return cb({
                code: grpc.status.NOT_FOUND,
                message: "Geolocation Entry not found.",
            },null);
        }
        return cb(null, {
            message: "Radius set succesfully.",
            geo:updatedGeo
        });
    } catch (error) {
        console.error("Error setting radius:", error);
        return cb({
            code: grpc.status.INTERNAL,
            message: "Internal Server Error: " + error.message,
        });
    }
}

export {setLocation,isPatientInSafeZone,setRadius};