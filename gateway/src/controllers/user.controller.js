import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
const PROTO_PATH = "./protos/user.proto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
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
  client.createUser(createUserRequest, (err, msg) => {
    if (err) {
      let httpStatus;
      switch (err.code) {
        case grpc.status.INVALID_ARGUMENT:
          httpStatus = 400;
          break;
        case grpc.status.ALREADY_EXISTS:
          httpStatus = 409;
          break;
        case grpc.status.INTERNAL:
        default:
          httpStatus = 500;
          break;
      }
      return res
        .status(httpStatus)
        .json(
          new ApiResponse(httpStatus, undefined, err.message.split(": ")[1])
        );
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, { user: msg.user }, msg.message));
    }
  });
});

const loginUser = AsyncHandler(async(req,res)=>{

})
const loginPatient = AsyncHandler(async(req,res)=>{

})
const logoutUser = AsyncHandler(async(req,res)=>{

})
const getCurrentUser = AsyncHandler(async(req,res)=>{

})

export { registerUser,loginUser,loginPatient,logoutUser,getCurrentUser };
