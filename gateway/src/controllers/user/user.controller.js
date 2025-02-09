import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
const PROTO_PATH = "./protos/user.proto";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AsyncHandler } from "../../utils/AsyncHandler.js";
import {GrpcError} from "../../utils/GrpcError.js";
import dotenv from "dotenv";
dotenv.config();

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const UserService = grpc.loadPackageDefinition(packageDefinition).UserService;
const client = new UserService(
  process.env.USER_SERVICE_PORT,
  grpc.credentials.createInsecure()
);


const logoutUser = AsyncHandler(async(req,res)=>{
  const {id} = req.body;
  const logoutUserRequest = {id};
  client.logoutUser(logoutUserRequest,async(err,msg)=>{
    if(err){
      const response = await GrpcError(err);      
      return res
        .status(response.statusCode)
        .json(
          new ApiResponse(response.statusCode, undefined,response.message)
        );
    } else {
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      };
      res.clearCookie("accessToken", options);
      res.clearCookie("refreshToken", options);
      return res
        .status(200)
        .json(new ApiResponse(200,{}, msg.message));
    }
  })
})

const setPatientDiseases = AsyncHandler(async(req,res)=>{
  const {diseaseList} = req.body;
  const {patientId} = req.params;
  const setDiseasesRequest = {patientId,diseaseList};
  client.setDiseases(setDiseasesRequest,async(err,msg)=>{
    if(err){
      const response = await GrpcError(err);      
      return res
        .status(response.statusCode)
        .json(
          new ApiResponse(response.statusCode, undefined,response.message)
        );
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, { diseases: msg.diseases }, msg.message));
    }
  })
})

export { logoutUser,setPatientDiseases };
