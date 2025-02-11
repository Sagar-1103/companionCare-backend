import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
const PROTO_PATH = "./protos/geo.proto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { GrpcError } from "../utils/GrpcError.js";
import dotenv from "dotenv";
dotenv.config();

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const GeoService = grpc.loadPackageDefinition(packageDefinition).GeoService;
const geoClient = new GeoService(
  process.env.GEO_SERVICE_PORT,
  grpc.credentials.createInsecure()
);


const setFallStatus = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const {fallDetectionStatus} = req.body;
    const setFallStatusRequest = {patientId,fallDetectionStatus};
    geoClient.setFallStatus(setFallStatusRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { geo: msg.geo }, msg.message));
        }
    })
})

const setLocation = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const {lon,lat,type,radius} = req.body;
    const setLocationRequest = {patientId,lon,lat,type,radius};
    geoClient.setLocation(setLocationRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            console.log(msg);
            
            return res
            .status(200)
            .json(new ApiResponse(200, { geo: msg.geo }, msg.message));
        }
    })
})

const getGeoDetails = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const getGeoDetailsRequest = {patientId};
    geoClient.getGeoDetails(getGeoDetailsRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { geo: msg.geo }, msg.message));
        }
    })
})

const getSafeZoneStatus = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const isPatientInSafeZoneRequest = {patientId};
    geoClient.isPatientInSafeZone(isPatientInSafeZoneRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { isInsideSafeZone: msg.isInsideSafeZone }, msg.message));
        }
    })
})

const setRadius = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const {radius} = req.body;
    const setRadiusRequest = {patientId,radius};
    geoClient.setRadius(setRadiusRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { geo: msg.geo }, msg.message));
        }
    })
})

export {setFallStatus,setLocation,getGeoDetails,getSafeZoneStatus,setRadius};
