import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import { logoutUser, setDiseases} from "./src/app.js";
import { createCaretaker,createCaretakerToken,createPatientByCaretaker, getCurrentCaretaker } from "./src/caretaker.js";
import { createDoctor, createDoctorToken, getCurrentDoctor, getPatients, pairPatient } from "./src/doctor.js";
import { createPatientTokenOnLogin, createPatientWithoutCaretaker, createTokenOnCode, getCurrentPatient } from "./src/patient.js";

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
  createCaretaker,
  createDoctor,
  createPatientByCaretaker,
  createDoctorToken,
  createCaretakerToken,
  getCurrentCaretaker,
  getCurrentDoctor,
  pairPatient,
  createPatientWithoutCaretaker,
  createPatientTokenOnLogin,
  createTokenOnCode,
  getCurrentPatient,
  logoutUser,
  setDiseases,
  getPatients,
});
