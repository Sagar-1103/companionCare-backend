import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import { generateReport, getReportForDoctor, getReportForPatient, storeReport } from "./src/app.js";
const PROTO_PATH = "./protos/ai.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});


startGrpcServer();

const server = getGrpcServer();
const ai_proto = grpc.loadPackageDefinition(packageDefinition);
server.addService(ai_proto.AiService.service, {
    storeReport,
    getReportForDoctor,
    getReportForPatient,
    generateReport,
});
