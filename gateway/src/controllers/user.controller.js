import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
const PROTO_PATH = "./protos/user.proto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {GrpcError} from "../utils/GrpcError.js";
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

const registerUser = AsyncHandler(async (req, res) => {
  const {name,email,password,phNo,gender,dob,role} = req.body;
  const createUserRequest = {
    user: {
      email,
      name,
      password,
      phNo,
      gender,
      dob,
      role
    },
  };
  client.createUser(createUserRequest, async(err, msg) => {
    if (err) {
      const response = await GrpcError(err);      
      return res
        .status(response.statusCode)
        .json(
          new ApiResponse(response.statusCode, undefined,response.message)
        );
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, { user: msg.user }, msg.message));
    }
  });
});

const loginUser = AsyncHandler(async(req,res)=>{
  const { email, password } = req.body;
  const createTokenRequest = {
    user: {
      email,
      password,
    },
  };

  client.createToken(createTokenRequest,async(err,msg)=>{
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
        .json(new ApiResponse(200, { user: msg.user,accessToken:msg.accessToken,refreshToken:msg.refreshToken }, msg.message));
    }
  });

})

const registerPatient = AsyncHandler(async(req,res)=>{

})

const loginPatient = AsyncHandler(async(req,res)=>{
  
})
const logoutUser = AsyncHandler(async(req,res)=>{
  const {id} = req.body;
  const logoutUserRequest = {
    user: {
      id
    },
  };
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

const getCurrentUser = AsyncHandler(async(req,res)=>{
  const {id} = req.body;
  const getUserRequest = {
      id
  };
  client.getCurrentUser(getUserRequest,async(err,msg)=>{
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
        .json(new ApiResponse(200, { user: msg.user }, msg.message));
    }
  })
})

export { registerUser,loginUser,loginPatient,logoutUser,getCurrentUser,registerPatient };
