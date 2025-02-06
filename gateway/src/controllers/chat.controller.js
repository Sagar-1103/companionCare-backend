import protoLoader from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";
const PROTO_PATH = "./protos/chat.proto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { GrpcError } from "../utils/GrpcError.js";
import dotenv from "dotenv";
dotenv.config();

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const ChatService = grpc.loadPackageDefinition(packageDefinition).ChatService;
const client = new ChatService(
  process.env.CHAT_SERVICE_PORT,
  grpc.credentials.createInsecure()
);

const getRoomChats = AsyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const getChatsRequest = {
    roomId,
  };
  client.getChats(getChatsRequest, async (err, msg) => {
    if (err) {
      const response = await GrpcError(err);
      return res
        .status(response.statusCode)
        .json(
          new ApiResponse(response.statusCode, undefined, response.message)
        );
    } else {
        return res
        .status(200)
        .json(new ApiResponse(200, { chats: msg.chats }, msg.message));
    }
  });
});

const createRoom = AsyncHandler(async(req,res)=>{
  const { user1Id, user2Id } = req.body;
  const createRoomRequest = { user1Id, user2Id };
  client.createRoom(createRoomRequest,async(err,msg)=>{
    if(err){
      const response = await GrpcError(err);
      return res
        .status(response.statusCode)
        .json(
          new ApiResponse(response.statusCode, undefined, response.message)
        );
    } else {
      return res
      .status(200)
      .json(new ApiResponse(200, { room: msg.room }, msg.message));
    }
  })
})

export { getRoomChats,createRoom };
