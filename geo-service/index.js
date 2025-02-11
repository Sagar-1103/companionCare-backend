import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import { setFallStatus } from "./src/fall.js";
import { isPatientInSafeZone, setLocation, setRadius } from "./src/location.js";
import { getGeoDetails } from "./src/app.js";
const PROTO_PATH = "./protos/geo.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});


startGrpcServer();

const server = getGrpcServer();
const geo_proto = grpc.loadPackageDefinition(packageDefinition);
server.addService(geo_proto.GeoService.service, {
    setFallStatus,
    setLocation,
    getGeoDetails,
    isPatientInSafeZone,
    setRadius,
});