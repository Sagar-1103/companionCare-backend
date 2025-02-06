import { WebSocketServer } from "ws";
import {createServer} from "node:http";
import {Chat} from "./models/chat.model.js";
import connectDatabase from "./config/db.config.js";

const server = createServer((request,response)=>{
    console.log((new Date()) + "Received request for "+ request.url);
    response.end("Hi There");
})

const wss = new WebSocketServer({server});
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
      console.log("Authenticated");
    } else if (data.type === 'MESSAGE') {
      // Broadcast to all users in the chat
      if (!authenticatedUsers.has(ws)) {
        console.log("Unauthorized user attempted to send a message.");
        ws.send(JSON.stringify({ error: "Unauthorized. Please authenticate first." }));
        return;
      }
      if (connections[data.roomId]) {
        await Chat.create({senderId:data.senderId,roomId:data.roomId,message:data.message})
        connections[data.roomId].forEach(client => {
          client.send(JSON.stringify({
            senderId: data.senderId,
            message: data.message,
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
  server.listen(8080,()=>{
    console.log("Web Socket Server is listening on port 8080");
})
})
