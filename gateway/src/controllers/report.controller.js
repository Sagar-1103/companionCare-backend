import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
const PROTO_PATH = "./protos/ai.proto";
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

const AiService = grpc.loadPackageDefinition(packageDefinition).AiService;
const reportClient = new AiService(
  process.env.AI_SERVICE_PORT,
  grpc.credentials.createInsecure()
);

const storeReports = AsyncHandler(async(req,res)=>{
    const {id,name,role,baseImage} = req.body;
    const storeReportRequest = {id,name,role,baseImage};
    reportClient.storeReport(storeReportRequest,async(err,msg)=>{
        if (err) {
            const response = await GrpcError(err);
            return res
                .status(response.statusCode)
                .json(new ApiResponse(response.statusCode, undefined, response.message));
        } else {
            return res
            .status(200)
            .json(new ApiResponse(200, { report: msg.report }, msg.message));
        }
    })
})

const getReportForPatient = AsyncHandler(async(req,res)=>{
  const {patientId} = req.body;
  const getReportForPatientRequest = {patientId};
  reportClient.getReportForPatient(getReportForPatientRequest,async(err,msg)=>{
      if (err) {
          const response = await GrpcError(err);
          return res
              .status(response.statusCode)
              .json(new ApiResponse(response.statusCode, undefined, response.message));
      } else {
          return res
          .status(200)
          .json(new ApiResponse(200, { reports: msg.reports }, msg.message));
      }
  })
})

const getReportForDoctor = AsyncHandler(async(req,res)=>{
  const {doctorId} = req.body;
  const getReportForDoctorRequest = {doctorId};
  reportClient.getReportForDoctor(getReportForDoctorRequest,async(err,msg)=>{
      if (err) {
          const response = await GrpcError(err);
          return res
              .status(response.statusCode)
              .json(new ApiResponse(response.statusCode, undefined, response.message));
      } else {
          return res
          .status(200)
          .json(new ApiResponse(200, { reports: msg.reports }, msg.message));
      }
  })
})

export {storeReports,getReportForPatient,getReportForDoctor};
