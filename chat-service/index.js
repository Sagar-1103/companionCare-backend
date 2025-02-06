import { startGrpcServer, getGrpcServer } from "./grpc.js";
import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
import {createRoom,getChats} from "./src/app.js";
import connectDatabase from "./src/config/db.config.js";
import { WebSocketServer } from "ws";
import {createServer} from "node:http";
import { Chat } from "./src/models/chat.model.js";
import dotenv from "dotenv";
import { connectCloudinary } from "./src/config/cloudinary.config.js";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

const PROTO_PATH = "./protos/chat.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

startGrpcServer();

const server = getGrpcServer();
const chat_proto = grpc.loadPackageDefinition(packageDefinition);
server.addService(chat_proto.ChatService.service, {
  createRoom,
  getChats,
});



const socketServer = createServer((request,response)=>{
  console.log((new Date()) + "Received request for "+ request.url);
  response.end("Hi There");
})

const wss = new WebSocketServer({server:socketServer});
const authenticatedUsers = new Set();

let connections = {};
wss.on('connection', (ws) => {
  ws.on("error",console.error);
  ws.on('message', async(message) => {
    try {
      const data = JSON.parse(message);
    if (data.type === 'AUTH') {
      // Store user WebSocket connection under roomId
      if (!connections[data.roomId]) connections[data.roomId] = [];
      connections[data.roomId].push(ws);
      authenticatedUsers.add(ws);
      // console.log("Authenticated");
    } else if (data.type === 'MESSAGE') {
      // Broadcast to all users in the chat
      if (!authenticatedUsers.has(ws)) {
        console.log("Unauthorized user attempted to send a message.");
        ws.send(JSON.stringify({ error: "Unauthorized. Please authenticate first." }));
        return;
      }
      if (connections[data.roomId]) {
        let messageContent = data.message;
        const messageType = data.messageType;
        if(messageType === "image"){
          try {
            const uploadResponse = await cloudinary.uploader.upload(`${data.image}`, {
              folder: "chat_images",
            });
            messageContent = uploadResponse.secure_url;
          } catch (error) {
            console.error("Cloudinary Upload Failed:", error);
            ws.send(JSON.stringify({ error: "Image upload failed." }));
            return;
          }
        }

        await Chat.create({senderId:data.senderId,roomId:data.roomId,message:messageContent,messageType})
        connections[data.roomId].forEach(client => {
          client.send(JSON.stringify({
            senderId: data.senderId,
            message: messageContent,
            messageType,
            timestamp: new Date().toISOString(),
          }));
        });
      }
    }
    } catch (error) {
      console.error("Invalid message format", error);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
    
  });
});

connectDatabase().then(()=>{
  connectCloudinary();
  socketServer.listen(process.env.SOCKET_PORT,()=>{
    console.log("Web Socket Server is listening on port 8080");
})
})
