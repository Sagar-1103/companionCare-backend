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


const setTime = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const {breakfast,lunch,snacks,dinner} = req.body;
    const setTimeRequest = {patientId,breakfast,lunch,snacks,dinner};
    medicationClient.setTime(setTimeRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { time: msg.time }, msg.message));
        }
    })
})

const getTime = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const getTimeRequest = {patientId};
    medicationClient.getTime(getTimeRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { time: msg.time }, msg.message));
        }
    })
})

const setMedication = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const {medicineName,medicineType,medicineDosage,timing,medText,startDate,endDate,before,after} = req.body;
    const setMedicationRequest = {medicineName,medicineType,medicineDosage,timing,medText,startDate,endDate,before,patientId,after};
    medicationClient.setMedication(setMedicationRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { medication: msg.medication }, msg.message));
        }
    })
})

const deleteMedication = AsyncHandler(async(req,res)=>{
    const {medicationId} = req.params;
    const deleteMedicationRequest = {medicationId};
    medicationClient.deleteMedication(deleteMedicationRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { deletedMedication: msg.deletedMedication }, msg.message));
        }
    })
})

const getMedications = AsyncHandler(async(req,res)=>{
    const {patientId} = req.params;
    const getMedicationsRequest = {patientId};
    medicationClient.getMedications(getMedicationsRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { medications: msg.medications }, msg.message));
        }
    })
})



export {setTime,setMedication,getMedications,deleteMedication,getTime};
