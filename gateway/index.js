import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import userRouter from "./src/routes/user.routes.js";
import chatRouter from "./src/routes/chat.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors({
    origin:"*",
}))

app.use(cookieParser());

app.use("/users",userRouter);
app.use("/chats",chatRouter);

app.listen(PORT, () => {
    console.log(`Gateway Server Running on port ${PORT}`);
  });