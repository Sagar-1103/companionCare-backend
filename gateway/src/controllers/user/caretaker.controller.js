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

const registerCaretaker = AsyncHandler(async (req, res) => {
  const {email,password,phNo,role,name} = req.body;
  const createCaretakerRequest = {email,password,role,phNo,name};
  userClient.createCaretaker(createCaretakerRequest, async(err, msg) => {
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
        .json(new ApiResponse(200, { caretaker: msg.caretaker,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });
});

const registerPatientByCaretaker = AsyncHandler(async(req,res)=>{
  const {name,email,dob,gender,caretakerId,role,phNo} = req.body;
  const createPatientByCaretakerRequest = {name,email,dob,gender,caretakerId,role,phNo}; 
  userClient.createPatientByCaretaker(createPatientByCaretakerRequest,async(err,response)=>{
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
      .json(new ApiResponse(200, { patient: response.patient }, response.message));
    }
  })
})

const loginCaretaker = AsyncHandler(async(req,res)=>{
  const { email, password } = req.body;
  const createCaretakerTokenRequest = { email, password };

  userClient.createCaretakerToken(createCaretakerTokenRequest,async(err,msg)=>{
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
        .json(new ApiResponse(200, { caretaker: msg.caretaker,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });

})


const getCaretaker = AsyncHandler(async(req,res)=>{
  const {id} = req.params;
  const getCurrentCaretakerRequest = { id };
  userClient.getCurrentCaretaker(getCurrentCaretakerRequest,async(err,msg)=>{
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
            .json(new ApiResponse(200, { caretaker: msg.caretaker }, msg.message));
    }
  })
})



export { registerCaretaker,registerPatientByCaretaker,loginCaretaker,getCaretaker };
