import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import { deleteMedication, getHealthDetails, getLogs, getMedications, getTime, setHealthDetails, setLog, setMedication, setTime, updateLog } from "./src/app.js";
const PROTO_PATH = "./protos/medication.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});


startGrpcServer();

const server = getGrpcServer();
const medication_proto = grpc.loadPackageDefinition(packageDefinition);
server.addService(medication_proto.MedicationService.service, {
  setTime,
  setMedication,
  deleteMedication,
  getMedications,
  setHealthDetails,
  getHealthDetails,
  getTime,
  setLog,
  getLogs,
  updateLog
});
