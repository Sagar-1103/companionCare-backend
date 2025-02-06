import grpc from "@grpc/grpc-js";
import connectDatabase from "./src/config/db.config.js";
import dotenv from "dotenv";
dotenv.config();

const server = new grpc.Server();

const startGrpcServer = async()=>{
    await connectDatabase();
    server.bindAsync(
        process.env.PORT,
        grpc.ServerCredentials.createInsecure(),
        (error,port)=>{
            if (error) {
                console.error("gRPC Server Error:", error);
                return;
            }
            else {
                // server.start();
                console.log(`Server running at 127.0.0.1:${port}`);
            }
        }
    )
}

const getGrpcServer = ()=>{
    return server;
}

export {startGrpcServer,getGrpcServer};