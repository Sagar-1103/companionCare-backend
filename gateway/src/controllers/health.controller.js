import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
const PROTO_PATH = "./protos/medication.proto";
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

const MedicationService = grpc.loadPackageDefinition(packageDefinition).MedicationService;
const medicationClient = new MedicationService(
  process.env.MEDICATION_SERVICE_PORT,
  grpc.credentials.createInsecure()
);

const setHealthDetails = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const {date,heartRate,bloodPressure,bodyTemperature,bloodSugar,spo2,sleep,steps} = req.body;
    const setHealthDetailsRequest = {
        health:{date,heartRate,bloodPressure,bodyTemperature,bloodSugar,spo2,sleep,steps,patientId}
    };
    medicationClient.setHealthDetails(setHealthDetailsRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { health: msg.health }, msg.message));
        }
    })
})


const getHealthDetails = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const {date} = req.body;
    const getHealthDetailsRequest = {patientId,date};
    medicationClient.getHealthDetails(getHealthDetailsRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { health: msg.health }, msg.message));
        }
    })
})



export {setHealthDetails,getHealthDetails};
