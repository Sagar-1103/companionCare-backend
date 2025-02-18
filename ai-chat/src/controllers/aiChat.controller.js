import { AsyncHandler } from "../utils/AsyncHandler.js";
import generatePrompt from "../utils/generatePrompt.js";
import questionSet from "../utils/questionSet.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIChat } from "../models/AIchat.model.js";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/ApiResponse.js";
dotenv.config();

const geminiChat = AsyncHandler(async (req, res) => {
  const { query } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const chatHistory = [];

  const userPrompt = await generatePrompt(query);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContentStream(userPrompt);

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  let reply = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    res.write(chunkText);
    reply += chunkText;
    console.log(chunkText);
  }
  res.end();
});

const getChats = AsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const chats = await AIChat.aggregate([
    {
      $match: {
        userId,
      },
    },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(200, chats, "Ai Chats fetched Successfully"));
});

export { geminiChat, getChats };
