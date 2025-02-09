import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import { deleteMedication, getMedications, setMedication, setTime } from "./src/app.js";
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
});

// {setTime,setMedication,deleteMedication,getMedications}