import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import {createToken, createUser, getCurrentUser, logoutUser, pairPatient} from "./src/app.js";

const PROTO_PATH = "./protos/user.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const user_proto = grpc.loadPackageDefinition(packageDefinition);

startGrpcServer();
const server = getGrpcServer();

server.addService(user_proto.UserService.service, {
  createUser,
  createToken,
  logoutUser,
  getCurrentUser,
  pairPatient,
});
