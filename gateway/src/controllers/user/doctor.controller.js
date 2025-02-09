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
const userClient = new UserService(
  process.env.USER_SERVICE_PORT,
  grpc.credentials.createInsecure()
);

const registerDoctor = AsyncHandler(async (req, res) => {
  const {email,password,phNo,role,name} = req.body;
  const createDoctorRequest = {email,password,role,phNo,name};
  userClient.createDoctor(createDoctorRequest, async(err, msg) => {
    if (err) {
      const response = await GrpcError(err);      
      return res
        .status(response.statusCode)
        .json(
          new ApiResponse(response.statusCode, undefined,response.message)
        );
    } else {
      const options = {
        httpOnly: true,
        secure: true
      };
      return res
        .cookie('accessToken', msg.accessToken, options)
        .cookie('refreshToken', msg.refreshToken, options)
        .status(200)
        .json(new ApiResponse(200, { doctor: msg.doctor,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });
});

const loginDoctor = AsyncHandler(async(req,res)=>{
  const { email, password } = req.body;
  const createDoctorTokenRequest = { email, password };

  userClient.createDoctorToken(createDoctorTokenRequest,async(err,msg)=>{
    if (err) {
      const response = await GrpcError(err);      
      return res
        .status(response.statusCode)
        .json(
          new ApiResponse(response.statusCode, undefined,response.message)
        );
    } else {
      const options = {
        httpOnly: true,
        secure: true
      };
      return res
        .cookie('accessToken', msg.accessToken, options)
        .cookie('refreshToken', msg.refreshToken, options)
        .status(200)
        .json(new ApiResponse(200, { doctor: msg.doctor,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });

})

const getDoctor = AsyncHandler(async(req,res)=>{
  const {id} = req.params;
  const getCurrentDoctorRequest = { id };
  userClient.getCurrentDoctor(getCurrentDoctorRequest,async(err,msg)=>{
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
            .json(new ApiResponse(200, { doctor: msg.doctor }, msg.message));
    }
  })
})

const pairPatientToDoctor = AsyncHandler(async(req,res)=>{
  const {code,doctorId} = req.body;
  const pairPatientRequest = {code,doctorId};
  userClient.pairPatient(pairPatientRequest,async(err,msg)=>{
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
        .json(new ApiResponse(200, { }, msg.message));
    }
  })
})

export { registerDoctor,loginDoctor ,getDoctor,pairPatientToDoctor};
