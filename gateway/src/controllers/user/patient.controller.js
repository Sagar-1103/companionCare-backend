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

const registerPatient = AsyncHandler(async (req, res) => {
  const {name,email,password,phNo,gender,dob,role} = req.body;
  const createPatientWithoutCaretakerRequest = {name,email,password,phNo,gender,dob,role};
  userClient.createPatientWithoutCaretaker(createPatientWithoutCaretakerRequest, async(err, msg) => {
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
        .json(new ApiResponse(200, { patient: msg.patient,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });
});

const loginPatient = AsyncHandler(async(req,res)=>{
  const { email, password } = req.body;
  const createPatientTokenOnLoginRequest = { email, password };

  userClient.createPatientTokenOnLogin(createPatientTokenOnLoginRequest,async(err,msg)=>{
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
        .json(new ApiResponse(200, { patient: msg.patient,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });

})


const loginPatientOnCode = AsyncHandler(async(req,res)=>{
  const { code } = req.body;
  const createTokenOnCodeRequest = { code };

  userClient.createTokenOnCode(createTokenOnCodeRequest,async(err,msg)=>{
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
        .json(new ApiResponse(200, { patient: msg.patient,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });

})


const getPatient = AsyncHandler(async(req,res)=>{
  const {id} = req.body;
  const getCurrentPatientRequest = { id };
  userClient.getCurrentPatient(getCurrentPatientRequest,async(err,msg)=>{
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
          .json(new ApiResponse(200, { patient: msg.patient }, msg.message));
    }
  })
})


export {registerPatient,loginPatient,loginPatientOnCode,getPatient};
