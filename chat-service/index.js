import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";

const PROTO_PATH = "./protos/chat.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

startGrpcServer();

// const server = getGrpcServer();
// const chat_proto = grpc.loadPackageDefinition(packageDefinition);
// server.addService(chat_proto.ChatService.service, {

// });
